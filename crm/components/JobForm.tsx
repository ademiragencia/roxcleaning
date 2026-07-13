import { inputClass, labelClass, Button, LinkButton } from "@/components/ui";
import { SERVICE_TYPES, serviceTypeLabel, RECURRENCES, recurrenceLabel } from "@/lib/labels";
import type { Job, Client, Profile } from "@/lib/types";

export function JobForm({
  action,
  clients,
  staff,
  job,
  defaultClientId,
  cancelHref,
  error,
}: {
  action: (formData: FormData) => void;
  clients: Pick<Client, "id" | "name">[];
  staff: Pick<Profile, "id" | "full_name">[];
  job?: Job;
  defaultClientId?: string;
  cancelHref: string;
  error?: string;
}) {
  // ISO → value for <input type="datetime-local">
  let scheduledLocal = "";
  if (job?.scheduled_at) {
    const d = new Date(job.scheduled_at);
    const pad = (n: number) => String(n).padStart(2, "0");
    scheduledLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const selectedClient = job?.client_id ?? defaultClientId ?? "";

  return (
    <form action={action} className="space-y-4">
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Client</label>
          <select name="client_id" defaultValue={selectedClient} className={inputClass}>
            <option value="">— none —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input name="title" defaultValue={job?.title ?? "Cleaning"} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Service</label>
          <select name="service_type" defaultValue={job?.service_type ?? "house"} className={inputClass}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {serviceTypeLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Date &amp; time</label>
          <input type="datetime-local" name="scheduled_at" defaultValue={scheduledLocal} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Duration (min)</label>
          <input type="number" name="duration_min" min={30} step={15} defaultValue={job?.duration_min ?? 120} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Recurrence</label>
          <select name="recurrence" defaultValue={job?.recurrence ?? "none"} className={inputClass}>
            {RECURRENCES.map((r) => (
              <option key={r} value={r}>
                {recurrenceLabel(r)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Price ($)</label>
          <input type="number" name="price" min={0} step="0.01" defaultValue={job?.price ?? ""} className={inputClass} placeholder="0.00" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Assign to</label>
        <select name="assigned_to" defaultValue={job?.assigned_to ?? ""} className={inputClass}>
          <option value="">— unassigned —</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name ?? "Unnamed"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={3} defaultValue={job?.notes ?? ""} className={inputClass} placeholder="Gate code, supplies, special requests…" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">{job ? "Save changes" : "Schedule cleaning"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
