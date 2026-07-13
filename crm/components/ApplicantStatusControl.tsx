"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ApplicantStatus } from "@/lib/types";
import { APPLICANT_STATUSES, applicantStatusLabel } from "@/lib/applicants";
import { updateApplicantStatus } from "@/app/(dashboard)/applicants/actions";

export function ApplicantStatusControl({ id, status }: { id: string; status: ApplicantStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await updateApplicantStatus(id, e.target.value as ApplicantStatus);
          router.refresh();
        })
      }
      className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm font-medium disabled:opacity-60"
    >
      {APPLICANT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {applicantStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}
