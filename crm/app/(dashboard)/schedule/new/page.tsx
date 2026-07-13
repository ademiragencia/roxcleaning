import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { JobForm } from "@/components/JobForm";
import { createJob } from "@/app/(dashboard)/schedule/actions";
import type { Client, Profile } from "@/lib/types";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; error?: string }>;
}) {
  await requireAdmin();
  const { client, error } = await searchParams;
  const supabase = await createClient();
  const [{ data: clients }, { data: staff }] = await Promise.all([
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("profiles").select("id,full_name").order("full_name"),
  ]);

  return (
    <>
      <PageHeader title="Schedule a cleaning" />
      <Card className="max-w-2xl p-6">
        <JobForm
          action={createJob}
          clients={(clients ?? []) as Pick<Client, "id" | "name">[]}
          staff={(staff ?? []) as Pick<Profile, "id" | "full_name">[]}
          defaultClientId={client}
          cancelHref="/schedule"
          error={error}
        />
      </Card>
    </>
  );
}
