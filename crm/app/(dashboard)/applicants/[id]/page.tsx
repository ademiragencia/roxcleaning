import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Badge, Button } from "@/components/ui";
import { dateShort } from "@/lib/format";
import { ENGLISH_TEST, scoreApplicant, scoreTone } from "@/lib/applicants";
import { ApplicantStatusControl } from "@/components/ApplicantStatusControl";
import { deleteApplicant } from "@/app/(dashboard)/applicants/actions";
import type { Applicant } from "@/lib/types";

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("applicants").select("*").eq("id", id).single();
  if (!data) notFound();
  const a = data as Applicant;
  const score = scoreApplicant(a);
  const del = deleteApplicant.bind(null, id);
  const ans = a.test_answers ?? {};

  const info: [string, string | null][] = [
    ["Phone", a.phone],
    ["Email", a.email],
    ["Location", a.location],
    ["Legally allowed to work", a.legal_to_work],
    ["Transportation", a.has_transport],
    ["English (self-rated)", a.english_self],
    ["Experience", a.has_experience === "yes" ? `Yes${a.years_experience ? ` · ${a.years_experience}` : ""}` : "No"],
    ["Availability", a.availability?.replace("_", " ") ?? null],
    ["Earliest start", dateShort(a.start_date)],
    ["Preferred hours", a.hours_note],
  ];

  const breakdown: [string, number, number][] = [
    ["English test", score.breakdown.englishTest, 60],
    ["English self-rating", score.breakdown.englishSelf, 15],
    ["Experience", score.breakdown.experience, 10],
    ["Availability", score.breakdown.availability, 10],
    ["Work eligibility & transport", score.breakdown.logistics, 5],
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/applicants" className="text-sm font-medium text-graphite/50 hover:text-magenta">← Back to applicants</Link>
        <div className="flex items-center gap-2">
          <ApplicantStatusControl id={id} status={a.status} />
          <form action={del}>
            <Button variant="danger" type="submit">Delete</Button>
          </form>
        </div>
      </div>

      <PageHeader title={a.full_name} subtitle={a.location ?? undefined} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score + info */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${
                { green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-rose-100 text-rose-700" }[scoreTone(score.total)]
              }`}>
                {score.total}
              </div>
              <div>
                <p className="text-sm font-semibold text-graphite">Fit score / 100</p>
                <p className="text-sm text-graphite/55">English test: {score.correct}/5 correct</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {breakdown.map(([label, val, max]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-graphite/60">{label}</span>
                    <span className="font-semibold text-graphite">{val}/{max}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-magenta" style={{ width: `${(val / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Contact & details</h2>
            <dl className="space-y-3">
              {info.filter(([, v]) => v && v !== "—").map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-graphite/40">{k}</dt>
                  <dd className="text-sm capitalize text-graphite">{v}</dd>
                </div>
              ))}
              {a.phone && (
                <div className="flex gap-2 pt-1">
                  <a href={`tel:${a.phone}`} className="rounded-lg border border-teal px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal hover:text-white">Call</a>
                  {a.email && <a href={`mailto:${a.email}`} className="rounded-lg border border-teal px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal hover:text-white">Email</a>}
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* Answers */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">English test</h2>
            <div className="space-y-4">
              {ENGLISH_TEST.map((t, i) => {
                const picked = ans[`q${i}`];
                const isCorrect = picked === t.answer;
                return (
                  <div key={i} className="rounded-xl border border-black/5 p-3">
                    <p className="text-sm font-medium text-graphite">{i + 1}. {t.q}</p>
                    <p className={`mt-1.5 text-sm ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {isCorrect ? "✓" : "✗"} Answered: {picked != null ? t.options[picked] : "—"}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-graphite/50">Correct: {t.options[t.answer]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {a.writing_sample && (
            <Card className="p-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-graphite/50">Writing sample (reply to an upset customer)</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-graphite/85">{a.writing_sample}</p>
            </Card>
          )}

          {(a.why_join || a.experience_details) && (
            <Card className="p-6">
              {a.why_join && (
                <>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-graphite/50">Why they want to join</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-graphite/85">{a.why_join}</p>
                </>
              )}
              {a.experience_details && (
                <div className={a.why_join ? "mt-4 border-t border-black/5 pt-4" : ""}>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-graphite/50">Experience</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-graphite/85">{a.experience_details}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
