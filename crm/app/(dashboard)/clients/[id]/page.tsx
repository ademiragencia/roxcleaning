import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, Card, Badge, LinkButton, Button } from "@/components/ui";
import { money, dateTime, dateShort } from "@/lib/format";
import { jobStatusLabel, jobStatusTone, serviceTypeLabel, docStatusLabel, docStatusTone } from "@/lib/labels";
import { deleteClientRecord } from "@/app/(dashboard)/clients/actions";
import type { Client, Job, CrmDocument } from "@/lib/types";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();
  const c = client as Client;

  const [{ data: jobs }, { data: docs }] = await Promise.all([
    supabase.from("jobs").select("*").eq("client_id", id).order("scheduled_at", { ascending: false }),
    supabase.from("documents").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  const isAdmin = profile.role === "admin";
  const del = deleteClientRecord.bind(null, id);

  const info: [string, string | null][] = [
    ["Phone", c.phone],
    ["Email", c.email],
    ["Address", c.address],
    ["City / area", c.city],
  ];

  return (
    <>
      <div className="mb-4">
        <Link href="/clients" className="text-sm font-medium text-graphite/50 hover:text-magenta">
          ← Back to clients
        </Link>
      </div>
      <PageHeader
        title={c.name}
        action={
          isAdmin ? (
            <div className="flex gap-2">
              <LinkButton href={`/clients/${id}/edit`} variant="secondary">
                Edit
              </LinkButton>
              <LinkButton href={`/schedule/new?client=${id}`}>+ Schedule cleaning</LinkButton>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Details</h2>
          <dl className="space-y-3">
            {info
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-graphite/40">{k}</dt>
                  <dd className="text-sm text-graphite">{v}</dd>
                </div>
              ))}
          </dl>
          {c.notes && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-graphite/40">Notes</p>
              <p className="mt-1 whitespace-pre-line text-sm text-graphite/80">{c.notes}</p>
            </div>
          )}
          {isAdmin && (
            <form action={del} className="mt-6 border-t border-black/5 pt-4">
              <Button variant="danger" type="submit" className="w-full">
                Delete client
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Cleanings</h2>
              {isAdmin && (
                <Link href={`/schedule/new?client=${id}`} className="text-sm font-semibold text-magenta hover:underline">
                  + Add
                </Link>
              )}
            </div>
            {(jobs as Job[] | null)?.length ? (
              <div className="divide-y divide-black/5">
                {(jobs as Job[]).map((j) => (
                  <div key={j.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-graphite">{j.title}</p>
                      <p className="text-xs text-graphite/50">
                        {serviceTypeLabel(j.service_type)} · {dateTime(j.scheduled_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {j.price != null && <span className="text-sm text-graphite/70">{money(j.price)}</span>}
                      <Badge tone={jobStatusTone(j.status)}>{jobStatusLabel(j.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-sm text-graphite/50">No cleanings scheduled yet.</p>
            )}
          </Card>

          {isAdmin && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-graphite/50">Quotes & invoices</h2>
                <Link href={`/invoices/new?client=${id}`} className="text-sm font-semibold text-magenta hover:underline">
                  + Add
                </Link>
              </div>
              {(docs as CrmDocument[] | null)?.length ? (
                <div className="divide-y divide-black/5">
                  {(docs as CrmDocument[]).map((d) => (
                    <Link key={d.id} href={`/invoices/${d.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-mist/60">
                      <div>
                        <p className="text-sm font-medium capitalize text-graphite">
                          {d.kind} {d.number ? `#${d.number}` : ""}
                        </p>
                        <p className="text-xs text-graphite/50">{dateShort(d.issue_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-graphite/70">{money(d.total)}</span>
                        <Badge tone={docStatusTone(d.status)}>{docStatusLabel(d.status)}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-sm text-graphite/50">No quotes or invoices yet.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
