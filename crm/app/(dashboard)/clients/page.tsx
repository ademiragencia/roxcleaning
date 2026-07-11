import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { PageHeader, LinkButton, Card, EmptyState } from "@/components/ui";
import type { Client } from "@/lib/types";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireProfile();
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clients").select("*").order("name");
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%,email.ilike.%${q}%`);
  const { data } = await query;
  const clients = (data ?? []) as Client[];

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Everyone you clean for."
        action={<LinkButton href="/clients/new">+ New client</LinkButton>}
      />

      <form className="mb-5">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, phone, city…"
          className="w-full max-w-md rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20"
        />
      </form>

      {clients.length ? (
        <Card className="divide-y divide-black/5">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-mist/60">
              <div className="min-w-0">
                <p className="truncate font-semibold text-graphite">{c.name}</p>
                <p className="truncate text-sm text-graphite/55">
                  {[c.city, c.phone].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-graphite/30">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState title={q ? "No clients match your search" : "No clients yet"} hint={q ? undefined : "Add your first client, or convert a lead into one."} />
      )}
    </>
  );
}
