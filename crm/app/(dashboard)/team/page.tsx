import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Badge } from "@/components/ui";
import { RoleControl } from "@/components/RoleControl";
import { dateShort } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default async function TeamPage() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at");
  const people = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader title="Team" subtitle="Manage who can access the CRM and what they can do." />

      <Card className="mb-6 border-teal/20 bg-teal/5 p-5">
        <p className="text-sm text-graphite/80">
          <strong>To add a team member:</strong> ask them to open the CRM and click “Create an account”.
          They'll join as <em>Staff</em> (they only see their own assigned cleanings). Promote them to{" "}
          <em>Admin</em> here if they should manage everything.
        </p>
      </Card>

      <Card className="divide-y divide-black/5">
        {people.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta/10 text-sm font-bold text-magenta-dark">
              {(p.full_name ?? "?").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-graphite">
                {p.full_name ?? "Unnamed"} {p.id === me.id && <span className="text-xs font-normal text-graphite/40">(you)</span>}
              </p>
              <p className="text-xs text-graphite/50">Joined {dateShort(p.created_at)}</p>
            </div>
            {p.role === "admin" ? <Badge tone="magenta">Admin</Badge> : <Badge tone="gray">Staff</Badge>}
            <RoleControl id={p.id} role={p.role} self={p.id === me.id} />
          </div>
        ))}
      </Card>
    </>
  );
}
