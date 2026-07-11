import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Card, Badge, LinkButton, EmptyState } from "@/components/ui";
import { JobStatusControl } from "@/components/JobStatusControl";
import { money, dateTime } from "@/lib/format";
import { serviceTypeLabel, recurrenceLabel } from "@/lib/labels";
import type { Job, Client, Profile } from "@/lib/types";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const profile = await requireProfile();
  const { view } = await searchParams;
  const showAll = view === "all";
  const supabase = await createClient();

  let query = supabase.from("jobs").select("*").order("scheduled_at", { ascending: true, nullsFirst: false });
  if (!showAll) query = query.eq("status", "scheduled").gte("scheduled_at", new Date(Date.now() - 12 * 3600 * 1000).toISOString());
  const { data: jobsData } = await query;
  const jobs = (jobsData ?? []) as Job[];

  // Look up client + assignee names in one go.
  const clientIds = [...new Set(jobs.map((j) => j.client_id).filter(Boolean))] as string[];
  const staffIds = [...new Set(jobs.map((j) => j.assigned_to).filter(Boolean))] as string[];
  const [{ data: clients }, { data: staff }] = await Promise.all([
    clientIds.length ? supabase.from("clients").select("id,name").in("id", clientIds) : Promise.resolve({ data: [] }),
    staffIds.length ? supabase.from("profiles").select("id,full_name").in("id", staffIds) : Promise.resolve({ data: [] }),
  ]);
  const clientName = new Map((clients as Pick<Client, "id" | "name">[]).map((c) => [c.id, c.name]));
  const staffName = new Map((staff as Pick<Profile, "id" | "full_name">[]).map((s) => [s.id, s.full_name]));

  const isAdmin = profile.role === "admin";

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle={isAdmin ? "All upcoming cleanings." : "Your assigned cleanings."}
        action={isAdmin ? <LinkButton href="/schedule/new">+ Schedule cleaning</LinkButton> : undefined}
      />

      <div className="mb-5 flex gap-2">
        <Link
          href="/schedule"
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!showAll ? "bg-magenta text-white" : "border border-black/10 bg-white text-graphite/70 hover:bg-mist"}`}
        >
          Upcoming
        </Link>
        <Link
          href="/schedule?view=all"
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${showAll ? "bg-magenta text-white" : "border border-black/10 bg-white text-graphite/70 hover:bg-mist"}`}
        >
          All
        </Link>
      </div>

      {jobs.length ? (
        <Card className="divide-y divide-black/5">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="w-32 shrink-0">
                <p className="text-sm font-semibold text-graphite">{dateTime(j.scheduled_at)}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-graphite">
                  {j.client_id ? clientName.get(j.client_id) ?? j.title : j.title}
                </p>
                <p className="truncate text-sm text-graphite/55">
                  {serviceTypeLabel(j.service_type)}
                  {j.recurrence !== "none" && ` · ${recurrenceLabel(j.recurrence)}`}
                  {j.assigned_to && staffName.get(j.assigned_to) ? ` · ${staffName.get(j.assigned_to)}` : ""}
                </p>
              </div>
              {j.price != null && <span className="text-sm text-graphite/70">{money(j.price)}</span>}
              {j.recurrence !== "none" && <Badge tone="teal">Recurring</Badge>}
              <JobStatusControl job={j} />
              {isAdmin && (
                <Link href={`/schedule/${j.id}/edit`} className="text-sm font-medium text-graphite/50 hover:text-magenta">
                  Edit
                </Link>
              )}
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          title={showAll ? "No cleanings yet" : "Nothing coming up"}
          hint={isAdmin ? "Schedule a cleaning to get started." : "You have no assigned cleanings right now."}
        />
      )}
    </>
  );
}
