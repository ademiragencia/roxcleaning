"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const get = (k: string) => {
    const v = (formData.get(k) as string | null)?.trim();
    return v ? v : null;
  };
  return {
    name: get("name") ?? "",
    email: get("email"),
    phone: get("phone"),
    address: get("address"),
    city: get("city"),
    notes: get("notes"),
  };
}

const err = (path: string, message: string) =>
  redirect(`${path}?error=${encodeURIComponent(message)}`);

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const values = fields(formData);
  if (!values.name) return err("/crm/clients/new", "Name is required.");

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...values, created_by: user?.id ?? null })
    .select("id")
    .single();

  if (error || !data) return err("/crm/clients/new", error?.message ?? "Could not save the client.");
  revalidatePath("/clients");
  redirect(`/crm/clients/${data.id}`);
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const values = fields(formData);
  const { error } = await supabase
    .from("clients")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return err(`/crm/clients/${id}/edit`, error.message);
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  redirect(`/crm/clients/${id}`);
}

export async function deleteClientRecord(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return err(`/crm/clients/${id}`, error.message);
  revalidatePath("/clients");
  redirect("/crm/clients");
}
