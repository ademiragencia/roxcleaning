"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui";
import { LEAD_STATUSES, leadStatusLabel, leadStatusTone } from "@/lib/labels";
import { timeAgo } from "@/lib/format";
import { updateLeadStatus, deleteLead, convertLeadToClient } from "@/app/(dashboard)/leads/actions";

export function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const details: [string, string | null][] = [
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Location", lead.location],
    ["Bedrooms", lead.bedrooms],
    ["Bathrooms", lead.bathrooms],
    ["Cleaning", lead.cleaning_type],
    ["Frequency", lead.frequency],
    ["Kids", lead.kids],
    ["Pets", lead.pets],
  ];

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold text-graphite">{lead.name}</p>
          <p className="truncate text-sm text-graphite/55">
            {[lead.location, lead.cleaning_type, lead.frequency].filter(Boolean).join(" · ") || "No details"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={leadStatusTone(lead.status)}>{leadStatusLabel(lead.status)}</Badge>
          <span className="hidden text-xs text-graphite/45 sm:inline">{timeAgo(lead.created_at)}</span>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-graphite/40 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-black/5 px-5 py-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {details
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-graphite/40">{k}</dt>
                  <dd className="text-sm text-graphite">{v}</dd>
                </div>
              ))}
          </dl>
          {lead.message && (
            <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-sm text-graphite/80">“{lead.message}”</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-graphite/50">Status:</span>
            <select
              value={lead.status}
              disabled={pending}
              onChange={(e) =>
                start(async () => {
                  await updateLeadStatus(lead.id, e.target.value as Lead["status"]);
                  router.refresh();
                })
              }
              className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm font-medium"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {leadStatusLabel(s)}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            {lead.phone && (
              <a
                href={`sms:${lead.phone}`}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold text-teal hover:bg-mist"
              >
                Text
              </a>
            )}
            {!lead.client_id && (
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await convertLeadToClient(lead.id);
                    if (res?.clientId) router.push(`/clients/${res.clientId}`);
                    else router.refresh();
                  })
                }
                className="rounded-lg bg-teal px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
              >
                Convert to client
              </button>
            )}
            <button
              disabled={pending}
              onClick={() => {
                if (confirm("Delete this lead?"))
                  start(async () => {
                    await deleteLead(lead.id);
                    router.refresh();
                  });
              }}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
