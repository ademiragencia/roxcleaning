import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, EmptyState } from "@/components/ui";
import { LeadCard } from "@/components/LeadCard";
import { LEAD_STATUSES, leadStatusLabel } from "@/lib/labels";
import type { Lead, LeadStatus } from "@/lib/types";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireProfile();
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (status && (LEAD_STATUSES as string[]).includes(status)) {
    query = query.eq("status", status as LeadStatus);
  }
  const { data } = await query;
  const leads = (data ?? []) as Lead[];

  const filters: { key: string; label: string }[] = [
    { key: "", label: "All" },
    ...LEAD_STATUSES.map((s) => ({ key: s, label: leadStatusLabel(s) })),
  ];

  return (
    <>
      <PageHeader title="Leads" subtitle="Estimate requests from your website and other channels." />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/leads?status=${f.key}` : "/leads"}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active ? "bg-magenta text-white" : "border border-black/10 bg-white text-graphite/70 hover:bg-mist"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {leads.length ? (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No leads here yet"
          hint="When a visitor submits the estimate form on roxcleaningusa.com, it lands here automatically."
        />
      )}
    </>
  );
}
