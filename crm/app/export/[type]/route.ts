import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let headers: string[] = [];
  let rows: (string | number | null)[][] = [];

  if (type === "leads") {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    headers = ["Name", "Phone", "Email", "Location", "Bedrooms", "Bathrooms", "Cleaning", "Frequency", "Kids", "Pets", "Status", "Message", "Created"];
    rows = (data ?? []).map((l) => [l.name, l.phone, l.email, l.location, l.bedrooms, l.bathrooms, l.cleaning_type, l.frequency, l.kids, l.pets, l.status, l.message, l.created_at]);
  } else if (type === "clients") {
    const { data } = await supabase.from("clients").select("*").order("name");
    headers = ["Name", "Phone", "Email", "Address", "City", "Notes", "Created"];
    rows = (data ?? []).map((c) => [c.name, c.phone, c.email, c.address, c.city, c.notes, c.created_at]);
  } else if (type === "invoices") {
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    headers = ["Type", "Number", "Issue date", "Due date", "Status", "Subtotal", "Tax", "Total"];
    rows = (data ?? []).map((d) => [d.kind, d.number, d.issue_date, d.due_date, d.status, d.subtotal, d.tax, d.total]);
  } else {
    return new Response("Not found", { status: 404 });
  }

  const csv = toCsv(headers, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rox-${type}-${stamp}.csv"`,
    },
  });
}
