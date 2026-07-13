import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { ClientForm } from "@/components/ClientForm";
import { createClientRecord } from "@/app/(dashboard)/clients/actions";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <>
      <PageHeader title="New client" />
      <Card className="max-w-2xl p-6">
        <ClientForm action={createClientRecord} cancelHref="/clients" error={error} />
      </Card>
    </>
  );
}
