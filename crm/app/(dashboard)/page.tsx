import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, PageHeader, Badge } from "@/components/ui";
import { money, timeAgo } from "@/lib/format";
import { leadStatusTone, leadStatusLabel } from "@/lib/labels";
import type { Lead } from "@/lib/types";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const firstName = (profile.full_name ?? "there").split(" ")[0];

  // Counts (head:true → no rows returned, just the count)
  const [newLeads, clientsCount, upcoming, recentLeads, unpaid] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("scheduled_at", new Date().toISOString()),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("documents").select("total,status,kind").eq("kind", "invoice"),
  ]);

  const unpaidTotal = (unpaid.data ?? [])
    .filter((d) => d.status === "sent" || d.status === "overdue")
    .reduce((sum, d) => sum + Number(d.total ?? 0), 0);

  const stats = [
    { label: "New leads", value: newLeads.count ?? 0, href: "/leads", tone: "magenta" as const },
    { label: "Clients", value: clientsCount.count ?? 0, href: "/clients", tone: "teal" as const },
    { label: "Upcoming cleanings", value: upcoming.count ?? 0, href: "/schedule", tone: "blue" as const },
    { label: "Unpaid invoices", value: money(unpaidTotal), href: "/invoices", tone: "amber" as const },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName} 👋`} subtitle="Here's what's happening at Rox Cleaning today." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-graphite/60">{s.label}</p>
              <p className="mt-2 text-3xl font-bold text-graphite">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-graphite">Latest leads</h2>
          <Link href="/leads" className="text-sm font-semibold text-magenta hover:underline">
            View all →
          </Link>
        </div>
        <Card className="divide-y divide-black/5">
          {(recentLeads.data as Lead[] | null)?.length ? (
            (recentLeads.data as Lead[]).map((lead) => (
              <Link
                key={lead.id}
                href="/leads"
                className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-mist/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-graphite">{lead.name}</p>
                  <p className="truncate text-sm text-graphite/55">
                    {[lead.location, lead.cleaning_type, lead.frequency].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</Badge>
                  <span className="hidden text-xs text-graphite/45 sm:inline">{timeAgo(lead.created_at)}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="px-5 py-10 text-center text-sm text-graphite/50">
              No leads yet. They'll appear here automatically when someone submits the website estimate form.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
