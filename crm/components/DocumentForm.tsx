"use client";

import { useState } from "react";
import { inputClass, labelClass, Button, LinkButton } from "@/components/ui";
import { money } from "@/lib/format";
import { createDocument } from "@/app/(dashboard)/invoices/actions";
import type { Client } from "@/lib/types";

interface Row {
  description: string;
  qty: number;
  unit_price: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export function DocumentForm({
  clients,
  defaultClientId,
  defaultKind = "invoice",
  error,
}: {
  clients: Pick<Client, "id" | "name">[];
  defaultClientId?: string;
  defaultKind?: "quote" | "invoice";
  error?: string;
}) {
  const [rows, setRows] = useState<Row[]>([{ description: "", qty: 1, unit_price: 0 }]);
  const [tax, setTax] = useState(0);

  const subtotal = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.unit_price) || 0), 0);
  const total = subtotal + (Number(tax) || 0);

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={createDocument} className="space-y-5">
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      )}
      <input type="hidden" name="items" value={JSON.stringify(rows)} />
      <input type="hidden" name="tax" value={tax} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Type</label>
          <select name="kind" defaultValue={defaultKind} className={inputClass}>
            <option value="invoice">Invoice</option>
            <option value="quote">Quote / estimate</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Client</label>
          <select name="client_id" defaultValue={defaultClientId ?? ""} className={inputClass}>
            <option value="">— none —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Issue date</label>
          <input type="date" name="issue_date" defaultValue={today()} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input type="date" name="due_date" className={inputClass} />
        </div>
      </div>

      {/* Line items */}
      <div>
        <label className={labelClass}>Line items</label>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Description (e.g. Deep clean — 3 bed / 2 bath)"
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                min={0}
                step="1"
                value={r.qty}
                onChange={(e) => update(i, { qty: Number(e.target.value) })}
                className={`${inputClass} w-16`}
                aria-label="Quantity"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={r.unit_price}
                onChange={(e) => update(i, { unit_price: Number(e.target.value) })}
                className={`${inputClass} w-24`}
                aria-label="Unit price"
              />
              <span className="w-20 text-right text-sm text-graphite/70">
                {money((Number(r.qty) || 0) * (Number(r.unit_price) || 0))}
              </span>
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-graphite/40 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove line"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { description: "", qty: 1, unit_price: 0 }])}
          className="mt-2 text-sm font-semibold text-magenta hover:underline"
        >
          + Add line
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-graphite/60">Subtotal</span>
            <span className="font-medium">{money(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-graphite/60">Tax ($)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className={`${inputClass} w-24 text-right`}
            />
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={2} className={inputClass} placeholder="Payment terms, thank-you note…" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Create</Button>
        <LinkButton href="/invoices" variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
