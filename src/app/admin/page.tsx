import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";
import { AdminHeader, Card, StatCard, Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { RevenueChart, MiniBars } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getAnalytics } from "@/lib/admin/analytics";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order } from "@/types";

export default async function AdminDashboard() {
  const analytics = await getAnalytics(30);
  const supabase = await createClient();

  const [{ data: recent }, { data: queue }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase
      .from("orders")
      .select("*")
      .in("status", ["paid", "processing"])
      .order("created_at", { ascending: true })
      .limit(6),
  ]);

  const recentOrders = (recent as unknown as Order[]) ?? [];
  const fulfillmentQueue = (queue as unknown as Order[]) ?? [];

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Performance over the last 30 days."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (30d)" value={formatBDT(analytics.revenue)} trend={analytics.revenueTrend} />
        <StatCard label="Orders (30d)" value={String(analytics.orders)} trend={analytics.ordersTrend} />
        <StatCard label="Avg. Order Value" value={formatBDT(analytics.aov)} sub={`${analytics.units} units sold`} />
        <StatCard label="New Customers" value={String(analytics.newCustomers)} sub={`${analytics.returningRate.toFixed(0)}% returning`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">
            Revenue Trend
          </p>
          <RevenueChart data={analytics.series} />
        </Card>
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">
            Top Brands
          </p>
          {analytics.byBrand.length ? (
            <MiniBars data={analytics.byBrand} />
          ) : (
            <p className="py-8 text-center text-xs text-muted">No sales yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fulfillment queue */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-widest text-muted">
              <Truck size={14} /> Fulfillment Queue
            </p>
            <Link href="/admin/orders" className="text-xs text-gold">View all</Link>
          </div>
          {fulfillmentQueue.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">Nothing awaiting dispatch.</p>
          ) : (
            <ul className="divide-y divide-line">
              {fulfillmentQueue.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 hover:text-ivory">
                    <span className="text-sm text-ivory">{o.order_no}</span>
                    <span className="flex flex-wrap items-center justify-end gap-3">
                      <OrderStatusBadge status={o.status} />
                      <span className="text-sm text-ivory-dim tnum">{formatBDT(o.total)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Low stock */}
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">
            Low Stock Alerts
          </p>
          {analytics.lowStock.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">All stock levels healthy.</p>
          ) : (
            <ul className="divide-y divide-line">
              {analytics.lowStock.map((s, i) => (
                <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
                  <span className="text-sm text-ivory-dim">
                    {s.name} · {s.size}ml
                  </span>
                  <span className="text-sm text-rose tnum">{s.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ivory">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <EmptyRow colSpan={4} label="No orders yet." />
            ) : (
              recentOrders.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className="text-ivory hover:text-gold">
                      {o.order_no}
                    </Link>
                  </Td>
                  <Td>{formatDate(o.created_at)}</Td>
                  <Td><OrderStatusBadge status={o.status} /></Td>
                  <Td className="text-right tnum text-ivory">{formatBDT(o.total)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
