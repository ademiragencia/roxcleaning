"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/lib/types";

function parse(formData: FormData) {
  const str = (k: string) => {
    const v = (formData.get(k) as string | null)?.trim();
    return v ? v : null;
  };
  const scheduledLocal = str("scheduled_at");
  return {
    client_id: str("client_id"),
    title: str("title") ?? "Cleaning",
    service_type: str("service_type") ?? "house",
    scheduled_at: scheduledLocal ? new Date(scheduledLocal).toISOString() : null,
    duration_min: Number(formData.get("duration_min")) || 120,
    recurrence: str("recurrence") ?? "none",
    assigned_to: str("assigned_to"),
    price: formData.get("price") ? Number(formData.get("price")) : null,
    notes: str("notes"),
  };
}

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("jobs").insert(parse(formData)).select("id").single();
  if (error || !data) return;
  revalidatePath("/schedule");
  revalidatePath("/");
  redirect("/schedule");
}

export async function updateJob(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase.from("jobs").update(parse(formData)).eq("id", id);
  revalidatePath("/schedule");
  redirect("/schedule");
}

export async function updateJobStatus(id: string, status: JobStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/schedule");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteJob(id: string) {
  const supabase = await createClient();
  await supabase.from("jobs").delete().eq("id", id);
  revalidatePath("/schedule");
  redirect("/schedule");
}
