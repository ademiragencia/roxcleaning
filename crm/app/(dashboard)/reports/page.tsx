import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { money } from "@/lib/format";
import { serviceTypeLabel, SERVICE_TYPES } from "@/lib/labels";
import type { CrmDocument, Job, ServiceType } from "@/lib/types";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [{ data: docs }, { data: jobs }] = await Promise.all([
    supabase.from("documents").select("*").eq("kind", "invoice"),
    supabase.from("jobs").select("service_type,price,status,scheduled_at").eq("status", "done"),
  ]);
  const invoices = (docs ?? []) as CrmDocument[];
  const doneJobs = (jobs ?? []) as Pick<Job, "service_type" | "price" | "status" | "scheduled_at">[];

  const paid = invoices.filter((d) => d.status === "paid");
  const sum = (arr: { total?: number }[]) => arr.reduce((s, d) => s + Number(d.total ?? 0), 0);

  const paidSince = (start: Date) =>
    paid.filter((d) => {
      if (!d.issue_date) return false;
      return new Date(d.issue_date) >= start;
    });
  const totalCollected = sum(paid);
  const thisMonth = sum(paidSince(startOfMonth));
  const thisYear = sum(paidSince(startOfYear));
  const outstanding = invoices
    .filter((d) => d.status === "sent" || d.status === "overdue")
    .reduce((s, d) => s + Number(d.total ?? 0), 0);
  const avgInvoice = paid.length ? totalCollected / paid.length : 0;

  // Revenue by month (last 12)
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), total: 0 });
  }
  for (const d of paid) {
    if (!d.issue_date) continue;
    const key = monthKey(new Date(d.issue_date));
    const m = months.find((x) => x.key === key);
    if (m) m.total += Number(d.total ?? 0);
  }

  // Revenue by service (from completed jobs with a price)
  const byService = SERVICE_TYPES.map((s) => ({
    service: s,
    total: doneJobs.filter((j) => j.service_type === s).reduce((sum, j) => sum + Number(j.price ?? 0), 0),
    count: doneJobs.filter((j) => j.service_type === s).length,
  })).filter((r) => r.count > 0);
  const serviceTotal = byService.reduce((s, r) => s + r.total, 0);

  const exports = [
    { type: "leads", label: "Leads" },
    { type: "clients", label: "Clients" },
    { type: "invoices", label: "Quotes & invoices" },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Financials and data export." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Collected (this month)", value: money(thisMonth) },
          { label: "Collected (this year)", value: money(thisYear) },
          { label: "Outstanding", value: money(outstanding) },
          { label: "Avg. invoice", value: money(avgInvoice) },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm font-medium text-graphite/60">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-graphite">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Revenue by month</h2>
          <div className="space-y-1.5">
            {months.map((m) => {
              const max = Math.max(1, ...months.map((x) => x.total));
              return (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-xs text-graphite/50">{m.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-mist">
                    <div className="h-full rounded bg-gradient-to-r from-teal to-teal/70" style={{ width: `${(m.total / max) * 100}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs font-medium text-graphite/70">{money(m.total)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between border-t border-black/5 pt-3 text-sm font-semibold">
            <span className="text-graphite/60">Total collected (all time)</span>
            <span className="text-graphite">{money(totalCollected)}</span>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Revenue by service</h2>
          {byService.length ? (
            <div className="space-y-3">
              {byService.map((r) => (
                <div key={r.service}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-graphite/70">{serviceTypeLabel(r.service as ServiceType)} <span className="text-graphite/40">· {r.count}</span></span>
                    <span className="font-semibold text-graphite">{money(r.total)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-magenta" style={{ width: `${serviceTotal ? (r.total / serviceTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-sm text-graphite/50">No completed jobs with a price yet. Mark cleanings as “done” and set a price to see this.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Export data</h2>
        <p className="mt-1 text-sm text-graphite/60">Download your data as CSV (opens in Excel / Google Sheets).</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {exports.map((e) => (
            // Plain anchor (not next/link) so the browser downloads the file. basePath added manually.
            <a
              key={e.type}
              href={`/crm/export/${e.type}`}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-graphite hover:bg-mist"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {e.label} (CSV)
            </a>
          ))}
        </div>
      </Card>
    </>
  );
}
