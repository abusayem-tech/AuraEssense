import Link from "next/link";
import { AdminHeader, Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/constants";
import type { Order } from "@/types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  // Guard against invalid enum values which would otherwise throw a 500.
  const status =
    rawStatus && (ORDER_STATUS as readonly string[]).includes(rawStatus)
      ? rawStatus
      : undefined;
  const supabase = await createClient();
  let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const orders = (data as unknown as Order[]) ?? [];

  return (
    <div>
      <AdminHeader title="Orders" description="Manage and fulfill customer orders." />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="All" href="/admin/orders" active={!status} />
        {ORDER_STATUS.map((s) => (
          <FilterChip
            key={s}
            label={s.replace("_", " ")}
            href={`/admin/orders?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Tracking</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <EmptyRow colSpan={6} label="No orders found." />
          ) : (
            orders.map((o) => (
              <tr key={o.id}>
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="text-ivory hover:text-gold">
                    {o.order_no}
                  </Link>
                </Td>
                <Td>{o.recipient}</Td>
                <Td>{formatDate(o.created_at)}</Td>
                <Td><OrderStatusBadge status={o.status} /></Td>
                <Td className="text-xs">{o.paperfly_tracking_id ?? "—"}</Td>
                <Td className="text-right tnum text-ivory">{formatBDT(o.total)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`border px-3 py-1.5 text-xs uppercase tracking-widest capitalize ${
        active ? "border-gold bg-gold/10 text-gold" : "border-line text-ivory-dim hover:border-gold"
      }`}
    >
      {label}
    </Link>
  );
}
