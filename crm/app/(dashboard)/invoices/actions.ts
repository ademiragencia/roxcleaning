"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DocKind, DocStatus } from "@/lib/types";

interface ItemInput {
  description: string;
  qty: number;
  unit_price: number;
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient();

  const kind = ((formData.get("kind") as string) || "invoice") as DocKind;
  const client_id = (formData.get("client_id") as string) || null;
  const issue_date = (formData.get("issue_date") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;
  const taxAmount = Number(formData.get("tax")) || 0;

  let items: ItemInput[] = [];
  try {
    items = JSON.parse((formData.get("items") as string) || "[]");
  } catch {
    items = [];
  }
  items = items.filter((i) => i.description?.trim());

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unit_price) || 0), 0);
  const total = subtotal + taxAmount;

  // Simple sequential-ish number: <PREFIX>-<count+1>
  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind);
  const number = `${kind === "quote" ? "Q" : "INV"}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({ kind, client_id, issue_date, due_date, notes, subtotal, tax: taxAmount, total, number, status: "draft" })
    .select("id")
    .single();
  if (error || !doc) {
    redirect(`/invoices/new?error=${encodeURIComponent(error?.message ?? "Could not save.")}`);
  }

  if (items.length) {
    await supabase.from("document_items").insert(
      items.map((i) => ({
        document_id: doc.id,
        description: i.description.trim(),
        qty: Number(i.qty) || 1,
        unit_price: Number(i.unit_price) || 0,
        amount: (Number(i.qty) || 0) * (Number(i.unit_price) || 0),
      })),
    );
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${doc.id}`);
}

export async function updateDocumentStatus(id: string, status: DocStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { ok: true };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  await supabase.from("documents").delete().eq("id", id);
  revalidatePath("/invoices");
  redirect("/invoices");
}
