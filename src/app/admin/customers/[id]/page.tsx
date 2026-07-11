import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, StatCard } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { CustomerActions } from "@/components/admin/customer-actions";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order, Profile } from "@/types";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);

  const p = profile as unknown as (Profile & { is_blocked: boolean; notes: string | null }) | null;
  if (!p) notFound();
  const customerOrders = (orders as unknown as Order[]) ?? [];
  const paid = customerOrders.filter((o) => ["paid", "processing", "dispatched", "in_transit", "delivered"].includes(o.status));
  const ltv = paid.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold">
        <ArrowLeft size={14} /> Back to Customers
      </Link>
      <h1 className="mb-1 mt-4 font-display text-3xl text-ivory">{p.full_name ?? "Unnamed"}</h1>
      <p className="text-sm text-muted">{p.phone ?? "No phone"} · Joined {formatDate(p.created_at)}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Lifetime Value" value={formatBDT(ltv)} />
            <StatCard label="Orders" value={String(paid.length)} />
            <StatCard label="Loyalty Points" value={String(p.loyalty_points)} />
          </div>
          <Card>
            <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Order History</p>
            {customerOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No orders.</p>
            ) : (
              <ul className="divide-y divide-line">
                {customerOrders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 hover:text-ivory">
                      <span className="text-sm text-ivory">{o.order_no}</span>
                      <span className="flex flex-wrap items-center justify-end gap-3">
                        <span className="text-xs text-muted">{formatDate(o.created_at)}</span>
                        <OrderStatusBadge status={o.status} />
                        <span className="text-sm text-ivory-dim tnum">{formatBDT(o.total)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Manage</p>
          <CustomerActions userId={p.id} role={p.role} isBlocked={p.is_blocked} notes={p.notes ?? ""} />
        </Card>
      </div>
    </div>
  );
}
