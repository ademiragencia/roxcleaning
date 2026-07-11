import type { LeadStatus, JobStatus, DocStatus, DocKind, ServiceType, Recurrence } from "@/lib/types";

type Tone = "gray" | "magenta" | "teal" | "green" | "amber" | "red" | "blue";

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];
export function leadStatusLabel(s: LeadStatus): string {
  return { new: "New", contacted: "Contacted", quoted: "Quoted", won: "Won", lost: "Lost" }[s];
}
export function leadStatusTone(s: LeadStatus): Tone {
  return { new: "magenta", contacted: "blue", quoted: "amber", won: "green", lost: "gray" }[s] as Tone;
}

export const JOB_STATUSES: JobStatus[] = ["scheduled", "done", "canceled"];
export function jobStatusLabel(s: JobStatus): string {
  return { scheduled: "Scheduled", done: "Done", canceled: "Canceled" }[s];
}
export function jobStatusTone(s: JobStatus): Tone {
  return { scheduled: "blue", done: "green", canceled: "gray" }[s] as Tone;
}

export const DOC_STATUSES: DocStatus[] = ["draft", "sent", "paid", "overdue", "accepted", "declined"];
export function docStatusLabel(s: DocStatus): string {
  return {
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue",
    accepted: "Accepted",
    declined: "Declined",
  }[s];
}
export function docStatusTone(s: DocStatus): Tone {
  return {
    draft: "gray",
    sent: "blue",
    paid: "green",
    overdue: "red",
    accepted: "green",
    declined: "gray",
  }[s] as Tone;
}

export const SERVICE_TYPES: ServiceType[] = ["house", "office", "store", "str", "other"];
export function serviceTypeLabel(s: ServiceType): string {
  return {
    house: "House cleaning",
    office: "Office cleaning",
    store: "Store cleaning",
    str: "Vacation rental",
    other: "Other",
  }[s];
}

export const RECURRENCES: Recurrence[] = ["none", "weekly", "biweekly", "monthly"];
export function recurrenceLabel(r: Recurrence): string {
  return { none: "One-time", weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly" }[r];
}
