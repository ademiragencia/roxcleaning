import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Badge, LinkButton, EmptyState } from "@/components/ui";
import { money, dateShort } from "@/lib/format";
import { docStatusLabel, docStatusTone } from "@/lib/labels";
import type { CrmDocument, Client } from "@/lib/types";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireAdmin();
  const { kind } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (kind === "quote" || kind === "invoice") query = query.eq("kind", kind);
  const { data } = await query;
  const docs = (data ?? []) as CrmDocument[];

  const clientIds = [...new Set(docs.map((d) => d.client_id).filter(Boolean))] as string[];
  const { data: clients } = clientIds.length
    ? await supabase.from("clients").select("id,name").in("id", clientIds)
    : { data: [] };
  const clientName = new Map((clients as Pick<Client, "id" | "name">[]).map((c) => [c.id, c.name]));

  const filters = [
    { key: "", label: "All" },
    { key: "invoice", label: "Invoices" },
    { key: "quote", label: "Quotes" },
  ];

  return (
    <>
      <PageHeader
        title="Quotes & Invoices"
        action={<LinkButton href="/invoices/new">+ New</LinkButton>}
      />

      <div className="mb-5 flex gap-2">
        {filters.map((f) => {
          const active = (kind ?? "") === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={f.key ? `/invoices?kind=${f.key}` : "/invoices"}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${active ? "bg-magenta text-white" : "border border-black/10 bg-white text-graphite/70 hover:bg-mist"}`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {docs.length ? (
        <Card className="divide-y divide-black/5">
          {docs.map((d) => (
            <Link key={d.id} href={`/invoices/${d.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-mist/60">
              <div className="min-w-0">
                <p className="truncate font-semibold text-graphite">
                  {d.kind === "quote" ? "Quote" : "Invoice"} {d.number ? `#${d.number}` : ""}
                </p>
                <p className="truncate text-sm text-graphite/55">
                  {(d.client_id && clientName.get(d.client_id)) || "No client"} · {dateShort(d.issue_date)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-semibold text-graphite">{money(d.total)}</span>
                <Badge tone={docStatusTone(d.status)}>{docStatusLabel(d.status)}</Badge>
              </div>
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState title="No documents yet" hint="Create your first quote or invoice." />
      )}
    </>
  );
}
