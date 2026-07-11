"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function updateRole(id: string, role: Role) {
  const supabase = await createClient();
  // Guard: an admin cannot demote themselves (avoid locking everyone out).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === id && role !== "admin") {
    return { error: "You can't change your own role." };
  }
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/team");
  return { ok: true };
}
