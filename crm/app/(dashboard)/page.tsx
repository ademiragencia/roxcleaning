import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { Card, Badge } from "@/components/ui";
import { money, timeAgo, dateTime } from "@/lib/format";
import {
  leadStatusTone,
  leadStatusLabel,
  LEAD_STATUSES,
  jobStatusTone,
  jobStatusLabel,
  serviceTypeLabel,
} from "@/lib/labels";
import type { Lead, Job, CrmDocument, Client, Profile, LeadStatus } from "@/lib/types";

/* -------------------------------- helpers -------------------------------- */

function StatCard({
  label,
  value,
  href,
  hint,
  accent = "magenta",
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
  accent?: "magenta" | "teal" | "green" | "amber" | "blue";
}) {
  const bar = {
    magenta: "bg-magenta",
    teal: "bg-teal",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-sky-500",
  }[accent];
  const inner = (
    <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <p className="text-sm font-medium text-graphite/60">{label}</p>
      <p className="mt-2 text-2xl font-bold text-graphite">{value}</p>
      {hint && <p className="mt-1 text-xs text-graphite/45">{hint}</p>}
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}

/* ------------------------------- dashboard ------------------------------- */

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const isAdmin = profile.role === "admin";
  const firstName = (profile.full_name ?? "there").split(" ")[0];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  /* Upcoming cleanings (RLS limits staff to their own automatically) */
  const { data: upcomingData } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "scheduled")
    .gte("scheduled_at", startOfToday.toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(6);
  const upcoming = (upcomingData ?? []) as Job[];

  const { count: doneThisMonth } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "done")
    .gte("scheduled_at", startOfMonth.toISOString());

  // Names for the upcoming list
  const clientIds = [...new Set(upcoming.map((j) => j.client_id).filter(Boolean))] as string[];
  const staffIds = [...new Set(upcoming.map((j) => j.assigned_to).filter(Boolean))] as string[];
  const [{ data: clientRows }, { data: staffRows }] = await Promise.all([
    clientIds.length ? supabase.from("clients").select("id,name").in("id", clientIds) : Promise.resolve({ data: [] }),
    staffIds.length ? supabase.from("profiles").select("id,full_name").in("id", staffIds) : Promise.resolve({ data: [] }),
  ]);
  const clientName = new Map((clientRows as Pick<Client, "id" | "name">[]).map((c) => [c.id, c.name]));
  const staffName = new Map((staffRows as Pick<Profile, "id" | "full_name">[]).map((s) => [s.id, s.full_name]));

  /* ----- STAFF dashboard (simpler, focused on their schedule) ----- */
  if (!isAdmin) {
    const { count: myWeek } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("scheduled_at", startOfWeek.toISOString());

    return (
      <>
        <h1 className="text-2xl font-bold tracking-tight text-graphite">Hi {firstName} 👋</h1>
        <p className="mt-1 text-sm text-graphite/60">Here are your cleanings.</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <StatCard label="Upcoming this week" value={myWeek ?? 0} accent="blue" href="/schedule" />
          <StatCard label="Completed this month" value={doneThisMonth ?? 0} accent="green" />
        </div>

        <h2 className="mb-3 mt-8 text-lg font-bold text-graphite">Your next cleanings</h2>
        <Card className="divide-y divide-black/5">
          {upcoming.length ? (
            upcoming.map((j) => (
              <Link key={j.id} href="/schedule" className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-mist/60">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-graphite">
                    {j.client_id ? clientName.get(j.client_id) ?? j.title : j.title}
                  </p>
                  <p className="text-sm text-graphite/55">{serviceTypeLabel(j.service_type)} · {dateTime(j.scheduled_at)}</p>
                </div>
                <Badge tone={jobStatusTone(j.status)}>{jobStatusLabel(j.status)}</Badge>
              </Link>
            ))
          ) : (
            <p className="px-5 py-10 text-center text-sm text-graphite/50">No upcoming cleanings assigned to you.</p>
          )}
        </Card>
      </>
    );
  }

  /* ----- ADMIN dashboard (full analytics) ----- */
  const [
    { count: newLeads },
    { count: clientsCount },
    { data: allLeads },
    { data: invoices },
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id,status,created_at,name,location,cleaning_type,frequency").order("created_at", { ascending: false }),
    supabase.from("documents").select("total,status,kind,issue_date").eq("kind", "invoice"),
  ]);

  const leads = (allLeads ?? []) as Pick<Lead, "id" | "status" | "created_at" | "name" | "location" | "cleaning_type" | "frequency">[];
  const invs = (invoices ?? []) as Pick<CrmDocument, "total" | "status" | "issue_date">[];

  // Pipeline counts
  const pipeline = LEAD_STATUSES.map((s) => ({
    status: s,
    count: leads.filter((l) => l.status === s).length,
  }));
  const pipelineMax = Math.max(1, ...pipeline.map((p) => p.count));
  const leadsThisWeek = leads.filter((l) => new Date(l.created_at) >= startOfWeek).length;
  const wonCount = leads.filter((l) => l.status === "won").length;
  const closedCount = leads.filter((l) => l.status === "won" || l.status === "lost").length;
  const conversion = closedCount ? Math.round((wonCount / closedCount) * 100) : 0;

  // Revenue
  const paid = invs.filter((d) => d.status === "paid");
  const revenueThisMonth = paid
    .filter((d) => d.issue_date && new Date(d.issue_date) >= startOfMonth)
    .reduce((s, d) => s + Number(d.total ?? 0), 0);
  const unpaidTotal = invs
    .filter((d) => d.status === "sent" || d.status === "overdue")
    .reduce((s, d) => s + Number(d.total ?? 0), 0);

  // Revenue last 6 months
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: monthLabel(d), total: 0 });
  }
  for (const d of paid) {
    if (!d.issue_date) continue;
    const k = monthKey(new Date(d.issue_date));
    const m = months.find((x) => x.key === k);
    if (m) m.total += Number(d.total ?? 0);
  }
  const revMax = Math.max(1, ...months.map((m) => m.total));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-graphite">Welcome back, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-graphite/60">Your business at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/clients/new" className="rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold text-graphite hover:bg-mist">+ Client</Link>
          <Link href="/schedule/new" className="rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm font-semibold text-graphite hover:bg-mist">+ Cleaning</Link>
          <Link href="/invoices/new" className="rounded-xl bg-magenta px-3.5 py-2 text-sm font-semibold text-white hover:bg-magenta-dark">+ Invoice</Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue this month" value={money(revenueThisMonth)} accent="green" hint="Paid invoices" href="/invoices" />
        <StatCard label="New leads" value={newLeads ?? 0} accent="magenta" hint={`${leadsThisWeek} this week`} href="/leads?status=new" />
        <StatCard label="Upcoming cleanings" value={upcoming.length} accent="blue" href="/schedule" />
        <StatCard label="Unpaid invoices" value={money(unpaidTotal)} accent="amber" href="/invoices" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clients" value={clientsCount ?? 0} accent="teal" href="/clients" />
        <StatCard label="Cleanings done" value={doneThisMonth ?? 0} accent="teal" hint="This month" href="/schedule?view=all" />
        <StatCard label="Lead conversion" value={`${conversion}%`} accent="green" hint="Won ÷ closed" />
        <StatCard label="Total leads" value={leads.length} accent="magenta" href="/leads" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Revenue · last 6 months</h2>
          <div className="mt-6 flex h-40 items-end justify-between gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-magenta/70 to-magenta"
                    style={{ height: `${Math.max(4, (m.total / revMax) * 100)}%` }}
                    title={money(m.total)}
                  />
                </div>
                <span className="text-xs font-medium text-graphite/50">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-graphite/45">
            Paid invoices per month. Total shown on hover.
          </p>
        </Card>

        {/* Lead pipeline */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Lead pipeline</h2>
          <div className="mt-5 space-y-3">
            {pipeline.map((p) => (
              <Link key={p.status} href={`/leads?status=${p.status}`} className="block">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-graphite/70">{leadStatusLabel(p.status as LeadStatus)}</span>
                  <span className="font-semibold text-graphite">{p.count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    className={`h-full rounded-full ${
                      { new: "bg-magenta", contacted: "bg-sky-500", quoted: "bg-amber-500", won: "bg-emerald-500", lost: "bg-graphite/30" }[p.status]
                    }`}
                    style={{ width: `${(p.count / pipelineMax) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Upcoming cleanings */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Upcoming cleanings</h2>
            <Link href="/schedule" className="text-sm font-semibold text-magenta hover:underline">All →</Link>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-black/5">
              {upcoming.map((j) => (
                <div key={j.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-graphite">
                      {j.client_id ? clientName.get(j.client_id) ?? j.title : j.title}
                    </p>
                    <p className="text-xs text-graphite/50">
                      {dateTime(j.scheduled_at)}
                      {j.assigned_to && staffName.get(j.assigned_to) ? ` · ${staffName.get(j.assigned_to)}` : ""}
                    </p>
                  </div>
                  {j.price != null && <span className="text-sm text-graphite/70">{money(j.price)}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-graphite/50">Nothing scheduled yet.</p>
          )}
        </Card>

        {/* Recent leads */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Latest leads</h2>
            <Link href="/leads" className="text-sm font-semibold text-magenta hover:underline">All →</Link>
          </div>
          {leads.length ? (
            <div className="divide-y divide-black/5">
              {leads.slice(0, 6).map((l) => (
                <Link key={l.id} href="/leads" className="flex items-center justify-between gap-3 py-2.5 hover:bg-mist/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-graphite">{l.name}</p>
                    <p className="truncate text-xs text-graphite/50">
                      {[l.location, l.cleaning_type, l.frequency].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={leadStatusTone(l.status)}>{leadStatusLabel(l.status)}</Badge>
                    <span className="hidden text-xs text-graphite/40 sm:inline">{timeAgo(l.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-graphite/50">
              No leads yet — they arrive automatically from your website form.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
