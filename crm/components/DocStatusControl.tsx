"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CrmDocument } from "@/lib/types";
import { DOC_STATUSES, docStatusLabel } from "@/lib/labels";
import { updateDocumentStatus } from "@/app/(dashboard)/invoices/actions";

export function DocStatusControl({ doc }: { doc: CrmDocument }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Quotes use accepted/declined; invoices use sent/paid/overdue.
  const options = doc.kind === "quote"
    ? (["draft", "sent", "accepted", "declined"] as const)
    : (["draft", "sent", "paid", "overdue"] as const);
  const list = DOC_STATUSES.filter((s) => (options as readonly string[]).includes(s));
  return (
    <select
      value={doc.status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await updateDocumentStatus(doc.id, e.target.value as CrmDocument["status"]);
          router.refresh();
        })
      }
      className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm font-medium disabled:opacity-60"
    >
      {list.map((s) => (
        <option key={s} value={s}>
          {docStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}
