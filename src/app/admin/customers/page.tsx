import Link from "next/link";
import { AdminHeader, Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "@/components/admin/role-select";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_blocked: boolean;
  loyalty_points: number;
  created_at: string;
}

export default async function CustomersPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("user_id, total, status"),
  ]);

  const rows = (profiles as unknown as CustomerRow[]) ?? [];
  const spendMap = new Map<string, { orders: number; spend: number }>();
  for (const o of (orders ?? []) as { user_id: string | null; total: number; status: string }[]) {
    if (!o.user_id) continue;
    const paid = ["paid", "processing", "dispatched", "in_transit", "delivered"].includes(o.status);
    const cur = spendMap.get(o.user_id) ?? { orders: 0, spend: 0 };
    if (paid) {
      cur.orders += 1;
      cur.spend += o.total;
    }
    spendMap.set(o.user_id, cur);
  }

  return (
    <div>
      <AdminHeader title="Customers" description={`${rows.length} registered customers.`} />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Orders</Th>
            <Th>Lifetime Value</Th>
            <Th>Points</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} label="No customers yet." />
          ) : (
            rows.map((c) => {
              const s = spendMap.get(c.id) ?? { orders: 0, spend: 0 };
              return (
                <tr key={c.id}>
                  <Td>
                    <Link href={`/admin/customers/${c.id}`} className="text-ivory hover:text-gold">
                      {c.full_name ?? "Unnamed"}
                    </Link>
                    {c.is_blocked && <Badge variant="rose" className="ml-2">Blocked</Badge>}
                    <p className="text-xs text-muted">Joined {formatDate(c.created_at)}</p>
                  </Td>
                  <Td>{c.phone ?? "—"}</Td>
                  <Td className="tnum">{s.orders}</Td>
                  <Td className="tnum text-ivory">{formatBDT(s.spend)}</Td>
                  <Td className="tnum">{c.loyalty_points}</Td>
                  <Td>
                    <RoleSelect userId={c.id} role={c.role} />
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
