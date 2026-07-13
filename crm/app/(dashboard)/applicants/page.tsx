import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { scoreApplicant, scoreTone, applicantStatusLabel, applicantStatusTone } from "@/lib/applicants";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { APPLICANT_STATUSES } from "@/lib/applicants";

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("applicants").select("*");
  if (status && (APPLICANT_STATUSES as string[]).includes(status)) {
    query = query.eq("status", status as ApplicantStatus);
  }
  const { data } = await query;
  const applicants = ((data ?? []) as Applicant[])
    .map((a) => ({ a, score: scoreApplicant(a) }))
    .sort((x, y) => y.score.total - x.score.total); // rank best first

  const filters = [{ key: "", label: "All" }, ...APPLICANT_STATUSES.map((s) => ({ key: s, label: applicantStatusLabel(s) }))];

  return (
    <>
      <PageHeader title="Applicants" subtitle="Job applications, ranked by fit score. Best candidates first." />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (status ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/applicants?status=${f.key}` : "/applicants"}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${active ? "bg-magenta text-white" : "border border-black/10 bg-white text-graphite/70 hover:bg-mist"}`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {applicants.length ? (
        <Card className="divide-y divide-black/5">
          {applicants.map(({ a, score }) => (
            <Link key={a.id} href={`/applicants/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-mist/60">
              <div
                className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-bold ${
                  { green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-rose-100 text-rose-700" }[scoreTone(score.total)]
                }`}
                title="Fit score out of 100"
              >
                {score.total}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-graphite">{a.full_name}</p>
                <p className="truncate text-sm text-graphite/55">
                  {[a.location, a.english_self && `English: ${a.english_self}`, `${score.correct}/5 test`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={applicantStatusTone(a.status)}>{applicantStatusLabel(a.status)}</Badge>
                <span className="hidden text-xs text-graphite/40 sm:inline">{timeAgo(a.created_at)}</span>
              </div>
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No applications yet"
          hint="Share your careers link: roxcleaningusa.com/careers — applications appear here automatically, ranked by score."
        />
      )}
    </>
  );
}
