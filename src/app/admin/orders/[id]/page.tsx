import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderActions } from "@/components/admin/order-actions";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDateTime } from "@/lib/format";
import type { Order, OrderItem, OrderEvent } from "@/types";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("id", id)
    .maybeSingle();
  const order = data as unknown as (Order & { items: OrderItem[]; events: OrderEvent[] }) | null;
  if (!order) notFound();

  const events = (order.events ?? []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  let note = "";
  try {
    note = order.admin_notes && !order.admin_notes.startsWith("{") ? order.admin_notes : "";
  } catch {
    note = "";
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ivory">{order.order_no}</h1>
          <p className="mt-1 text-sm text-muted">{formatDateTime(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Items</p>
            <table className="w-full text-sm">
              <tbody>
                {order.items?.map((it) => (
                  <tr key={it.id} className="border-b border-line">
                    <td className="py-3">
                      <p className="text-ivory">{it.product_name}</p>
                      <p className="text-xs text-muted">{it.brand_name} · {it.size_ml}ml · {it.sku}</p>
                    </td>
                    <td className="py-3 text-center text-muted tnum">× {it.qty}</td>
                    <td className="py-3 text-right text-ivory tnum">{formatBDT(it.unit_price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatBDT(order.subtotal)} />
              <Row label="Delivery" value={formatBDT(order.delivery_fee)} />
              {order.discount > 0 && <Row label="Discount" value={`− ${formatBDT(order.discount)}`} />}
              {order.gift_wrap_fee > 0 && <Row label="Gift wrap" value={formatBDT(order.gift_wrap_fee)} />}
              {order.loyalty_redeemed > 0 && <Row label="Loyalty" value={`− ${formatBDT(order.loyalty_redeemed)}`} />}
            </dl>
            <div className="mt-3 flex justify-between border-t border-line pt-3">
              <span className="text-sm uppercase tracking-widest text-muted">Total</span>
              <span className="font-display text-2xl text-ivory tnum">{formatBDT(order.total)}</span>
            </div>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <p className="mb-3 text-[0.65rem] uppercase tracking-widest text-muted">Customer</p>
              <p className="text-ivory">{order.recipient}</p>
              <p className="text-sm text-muted">{order.phone}</p>
              <p className="text-sm text-muted">{order.email}</p>
              <p className="mt-2 text-sm text-ivory-dim">
                {order.address_line}, {order.area}, {order.city}
              </p>
              <p className="mt-1 text-xs capitalize text-muted">
                {order.zone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                {order.is_gift ? " · Gift order" : ""}
              </p>
              {order.gift_message && (
                <p className="mt-2 border-l-2 border-gold pl-3 text-xs italic text-ivory-dim">
                  “{order.gift_message}”
                </p>
              )}
            </Card>
            <Card>
              <p className="mb-3 text-[0.65rem] uppercase tracking-widest text-muted">Tracking</p>
              {order.paperfly_tracking_id && (
                <p className="mb-4 text-xs text-muted">AWB <span className="text-gold">{order.paperfly_tracking_id}</span></p>
              )}
              <TrackingTimeline events={events} currentStatus={order.status} />
            </Card>
          </div>
        </div>

        <div>
          <Card>
            <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Actions</p>
            <OrderActions
              orderId={order.id}
              status={order.status}
              hasTracking={!!order.paperfly_tracking_id}
              note={note}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ivory-dim tnum">{value}</dd>
    </div>
  );
}
