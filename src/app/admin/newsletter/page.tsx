import { AdminHeader, Table, Th, Td, EmptyRow, StatCard } from "@/components/admin/admin-ui";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  const subs = (data as unknown as Subscriber[]) ?? [];
  const csv = `data:text/csv;charset=utf-8,Email,Source,Date%0A${subs
    .map((s) => `${s.email},${s.source ?? ""},${s.created_at}`)
    .join("%0A")}`;

  return (
    <div>
      <AdminHeader
        title="Newsletter"
        description="Subscribers to the AuraEssence house list."
        action={
          <a
            href={csv}
            download="subscribers.csv"
            className="inline-flex h-9 items-center gap-2 border border-line-strong px-4 text-xs uppercase tracking-widest text-ivory-dim hover:border-gold hover:text-gold"
          >
            Export CSV
          </a>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Subscribers" value={String(subs.length)} />
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Email</Th>
            <Th>Source</Th>
            <Th>Subscribed</Th>
          </tr>
        </thead>
        <tbody>
          {subs.length === 0 ? (
            <EmptyRow colSpan={3} label="No subscribers yet." />
          ) : (
            subs.map((s) => (
              <tr key={s.id}>
                <Td className="text-ivory">{s.email}</Td>
                <Td className="capitalize">{s.source ?? "—"}</Td>
                <Td>{formatDate(s.created_at)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
