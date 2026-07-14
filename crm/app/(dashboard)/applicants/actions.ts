"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ApplicantStatus } from "@/lib/types";

export async function updateApplicantStatus(id: string, status: ApplicantStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("applicants").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/applicants");
  revalidatePath(`/applicants/${id}`);
  return { ok: true };
}

export async function deleteApplicant(id: string) {
  const supabase = await createClient();
  await supabase.from("applicants").delete().eq("id", id);
  revalidatePath("/applicants");
  redirect("/applicants");
}
