import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Returns the signed-in user's profile, or redirects to /login.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Profile row not created yet (rare race) — treat as staff placeholder.
    return {
      id: user.id,
      full_name: user.email ?? null,
      phone: null,
      role: "staff",
      created_at: new Date().toISOString(),
    };
  }
  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/crm");
  return profile;
}
