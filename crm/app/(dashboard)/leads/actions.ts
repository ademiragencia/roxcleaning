"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/types";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/leads");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/leads");
  revalidatePath("/");
  return { ok: true };
}

// Turn a lead into a client record and mark it won.
export async function convertLeadToClient(id: string) {
  const supabase = await createClient();
  const { data: lead, error: readErr } = await supabase.from("leads").select("*").eq("id", id).single();
  if (readErr || !lead) return { error: readErr?.message ?? "Lead not found" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client, error: insErr } = await supabase
    .from("clients")
    .insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.location,
      notes: [
        lead.cleaning_type && `Cleaning: ${lead.cleaning_type}`,
        lead.bedrooms && `Bedrooms: ${lead.bedrooms}`,
        lead.bathrooms && `Bathrooms: ${lead.bathrooms}`,
        lead.frequency && `Frequency: ${lead.frequency}`,
        lead.kids && `Kids: ${lead.kids}`,
        lead.pets && `Pets: ${lead.pets}`,
        lead.message && `Notes: ${lead.message}`,
      ]
        .filter(Boolean)
        .join("\n"),
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (insErr) return { error: insErr.message };

  await supabase.from("leads").update({ status: "won", client_id: client.id }).eq("id", id);
  revalidatePath("/leads");
  revalidatePath("/clients");
  revalidatePath("/");
  return { ok: true, clientId: client.id };
}
