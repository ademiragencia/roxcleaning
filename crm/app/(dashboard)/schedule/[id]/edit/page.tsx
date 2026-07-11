import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Button } from "@/components/ui";
import { JobForm } from "@/components/JobForm";
import { updateJob, deleteJob } from "@/app/(dashboard)/schedule/actions";
import type { Client, Profile, Job } from "@/lib/types";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: job }, { data: clients }, { data: staff }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).single(),
    supabase.from("clients").select("id,name").order("name"),
    supabase.from("profiles").select("id,full_name").order("full_name"),
  ]);
  if (!job) notFound();

  const action = updateJob.bind(null, id);
  const del = deleteJob.bind(null, id);

  return (
    <>
      <PageHeader title="Edit cleaning" />
      <Card className="max-w-2xl p-6">
        <JobForm
          action={action}
          job={job as Job}
          clients={(clients ?? []) as Pick<Client, "id" | "name">[]}
          staff={(staff ?? []) as Pick<Profile, "id" | "full_name">[]}
          cancelHref="/schedule"
        />
        <form action={del} className="mt-4 border-t border-black/5 pt-4">
          <Button variant="danger" type="submit">
            Delete cleaning
          </Button>
        </form>
      </Card>
    </>
  );
}
