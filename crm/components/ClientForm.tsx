import { inputClass, labelClass, Button, LinkButton } from "@/components/ui";
import type { Client } from "@/lib/types";

// Server-action driven form, reused for create and edit.
export function ClientForm({
  action,
  client,
  cancelHref,
}: {
  action: (formData: FormData) => void;
  client?: Client;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input name="name" required defaultValue={client?.name ?? ""} className={inputClass} placeholder="Jane Smith" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" defaultValue={client?.phone ?? ""} className={inputClass} placeholder="(407) 555-0123" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={client?.email ?? ""} className={inputClass} placeholder="jane@email.com" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input name="address" defaultValue={client?.address ?? ""} className={inputClass} placeholder="123 Main St" />
      </div>
      <div>
        <label className={labelClass}>City / area</label>
        <input name="city" defaultValue={client?.city ?? ""} className={inputClass} placeholder="Kissimmee, FL" />
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={4} defaultValue={client?.notes ?? ""} className={inputClass} placeholder="Access, preferences, pets…" />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit">{client ? "Save changes" : "Create client"}</Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
