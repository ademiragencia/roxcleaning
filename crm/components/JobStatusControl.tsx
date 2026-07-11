"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import { JOB_STATUSES, jobStatusLabel } from "@/lib/labels";
import { updateJobStatus } from "@/app/(dashboard)/schedule/actions";

export function JobStatusControl({ job }: { job: Job }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      value={job.status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          await updateJobStatus(job.id, e.target.value as Job["status"]);
          router.refresh();
        })
      }
      className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-semibold disabled:opacity-60"
    >
      {JOB_STATUSES.map((s) => (
        <option key={s} value={s}>
          {jobStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}
