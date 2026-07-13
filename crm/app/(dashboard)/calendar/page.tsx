import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { jobStatusTone } from "@/lib/labels";
import type { Job, Client } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOT: Record<string, string> = {
  scheduled: "border-sky-300 bg-sky-50 text-sky-700",
  done: "border-emerald-300 bg-emerald-50 text-emerald-700",
  canceled: "border-black/10 bg-mist text-graphite/50 line-through",
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  await requireProfile();
  const { m } = await searchParams;
  const supabase = await createClient();

  const today = new Date();
  const [y, mo] = (m ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`)
    .split("-")
    .map(Number);
  const year = y || today.getFullYear();
  const month = (mo || today.getMonth() + 1) - 1; // 0-indexed

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const mk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const { data: jobsData } = await supabase
    .from("jobs")
    .select("*")
    .gte("scheduled_at", monthStart.toISOString())
    .lt("scheduled_at", monthEnd.toISOString())
    .order("scheduled_at", { ascending: true });
  const jobs = (jobsData ?? []) as Job[];

  const clientIds = [...new Set(jobs.map((j) => j.client_id).filter(Boolean))] as string[];
  const { data: clientRows } = clientIds.length
    ? await supabase.from("clients").select("id,name").in("id", clientIds)
    : { data: [] };
  const clientName = new Map((clientRows as Pick<Client, "id" | "name">[]).map((c) => [c.id, c.name]));

  // Group jobs by day
  const byDay = new Map<string, Job[]>();
  for (const j of jobs) {
    if (!j.scheduled_at) continue;
    const key = ymd(new Date(j.scheduled_at));
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(j);
  }

  // Build the grid (weeks × 7), starting on Sunday
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthTitle = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayKey = ymd(today);

  return (
    <>
      <PageHeader
        title="Calendar"
        action={
          <div className="flex items-center gap-2">
            <Link href={`/calendar?m=${mk(prev)}`} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-mist">←</Link>
            <Link href="/calendar" className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-mist">Today</Link>
            <Link href={`/calendar?m=${mk(next)}`} className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-mist">→</Link>
          </div>
        }
      />
      <p className="-mt-3 mb-4 text-lg font-semibold text-graphite">{monthTitle}</p>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-black/5 bg-mist/60">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-graphite/50">{w}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const key = day ? ymd(day) : `${wi}-${di}`;
                const dayJobs = day ? byDay.get(ymd(day)) ?? [] : [];
                const isToday = day && ymd(day) === todayKey;
                return (
                  <div key={key} className={`min-h-[104px] border-b border-r border-black/5 p-1.5 ${day ? "" : "bg-mist/30"}`}>
                    {day && (
                      <>
                        <div className={`mb-1 text-right text-xs font-semibold ${isToday ? "text-magenta" : "text-graphite/50"}`}>
                          {isToday ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-magenta text-white">{day.getDate()}</span>
                          ) : (
                            day.getDate()
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 3).map((j) => (
                            <Link
                              key={j.id}
                              href={`/schedule/${j.id}/edit`}
                              className={`block truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${DOT[j.status]}`}
                              title={`${new Date(j.scheduled_at!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · ${j.client_id ? clientName.get(j.client_id) ?? j.title : j.title}`}
                            >
                              {new Date(j.scheduled_at!).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}{" "}
                              {j.client_id ? clientName.get(j.client_id) ?? j.title : j.title}
                            </Link>
                          ))}
                          {dayJobs.length > 3 && (
                            <p className="px-1 text-[10px] font-medium text-graphite/45">+{dayJobs.length - 3} more</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-graphite/60">
        <span className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded border ${DOT.scheduled}`} /> Scheduled</span>
        <span className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded border ${DOT.done}`} /> Done</span>
        <span className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded border ${DOT.canceled}`} /> Canceled</span>
      </div>
    </>
  );
}
