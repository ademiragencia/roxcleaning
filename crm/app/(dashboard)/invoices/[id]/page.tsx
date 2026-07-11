import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, Button, PageHeader } from "@/components/ui";
import { DocStatusControl } from "@/components/DocStatusControl";
import { money, dateShort } from "@/lib/format";
import { deleteDocument } from "@/app/(dashboard)/invoices/actions";
import type { CrmDocument, DocumentItem, Client } from "@/lib/types";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase.from("documents").select("*").eq("id", id).single();
  if (!doc) notFound();
  const d = doc as CrmDocument;

  const [{ data: items }, { data: client }] = await Promise.all([
    supabase.from("document_items").select("*").eq("document_id", id),
    d.client_id ? supabase.from("clients").select("*").eq("id", d.client_id).single() : Promise.resolve({ data: null }),
  ]);
  const c = client as Client | null;
  const del = deleteDocument.bind(null, id);
  const heading = `${d.kind === "quote" ? "Quote" : "Invoice"} ${d.number ? `#${d.number}` : ""}`;

  return (
    <>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/invoices" className="text-sm font-medium text-graphite/50 hover:text-magenta">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <DocStatusControl doc={d} />
          <form action={del}>
            <Button variant="danger" type="submit">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rox_horizontal.png" alt="Rox Cleaning" width={150} height={50} className="h-11 w-auto" />
            <p className="mt-2 text-sm text-graphite/60">Orlando &amp; Kissimmee, FL · roxcleaningusa@gmail.com</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase tracking-wide text-graphite">
              {d.kind === "quote" ? "Quote" : "Invoice"}
            </p>
            {d.number && <p className="text-sm text-graphite/60">#{d.number}</p>}
            <p className="mt-1 text-sm text-graphite/60">{dateShort(d.issue_date)}</p>
          </div>
        </div>

        {c && (
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-graphite/40">Bill to</p>
            <p className="mt-1 font-semibold text-graphite">{c.name}</p>
            {c.address && <p className="text-sm text-graphite/70">{c.address}</p>}
            {c.city && <p className="text-sm text-graphite/70">{c.city}</p>}
            {c.phone && <p className="text-sm text-graphite/70">{c.phone}</p>}
          </div>
        )}

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-graphite/40">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {((items as DocumentItem[] | null) ?? []).map((it) => (
              <tr key={it.id} className="border-b border-black/5">
                <td className="py-2.5 text-graphite">{it.description}</td>
                <td className="py-2.5 text-right text-graphite/70">{it.qty}</td>
                <td className="py-2.5 text-right text-graphite/70">{money(it.unit_price)}</td>
                <td className="py-2.5 text-right font-medium text-graphite">{money(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-graphite/60">Subtotal</span>
              <span>{money(d.subtotal)}</span>
            </div>
            {d.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-graphite/60">Tax</span>
                <span>{money(d.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-black/10 pt-1.5 text-base font-bold text-graphite">
              <span>Total</span>
              <span>{money(d.total)}</span>
            </div>
          </div>
        </div>

        {d.notes && <p className="mt-8 border-t border-black/5 pt-4 text-sm text-graphite/70">{d.notes}</p>}
      </Card>
    </>
  );
}
