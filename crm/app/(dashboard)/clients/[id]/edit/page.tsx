import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { ClientForm } from "@/components/ClientForm";
import { updateClientRecord } from "@/app/(dashboard)/clients/actions";
import type { Client } from "@/lib/types";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const action = updateClientRecord.bind(null, id);

  return (
    <>
      <PageHeader title={`Edit ${(client as Client).name}`} />
      <Card className="max-w-2xl p-6">
        <ClientForm action={action} client={client as Client} cancelHref={`/clients/${id}`} error={error} />
      </Card>
    </>
  );
}
