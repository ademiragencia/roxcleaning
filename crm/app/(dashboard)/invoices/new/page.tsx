import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { DocumentForm } from "@/components/DocumentForm";
import type { Client } from "@/lib/types";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; kind?: string; error?: string }>;
}) {
  await requireAdmin();
  const { client, kind, error } = await searchParams;
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("id,name").order("name");

  return (
    <>
      <PageHeader title="New quote / invoice" />
      <Card className="max-w-3xl p-6">
        <DocumentForm
          clients={(clients ?? []) as Pick<Client, "id" | "name">[]}
          defaultClientId={client}
          defaultKind={kind === "quote" ? "quote" : "invoice"}
          error={error}
        />
      </Card>
    </>
  );
}
