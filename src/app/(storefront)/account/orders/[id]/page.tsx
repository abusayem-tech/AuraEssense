import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order, OrderItem, OrderEvent } from "@/types";

export const metadata = { title: "Order Details" };

export default async function OrderDetailPage({
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

  const order = data as unknown as (Order & {
    items: OrderItem[];
    events: OrderEvent[];
  }) | null;
  if (!order) notFound();

  const events = (order.events ?? []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold"
      >
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl text-ivory">{order.order_no}</h2>
          <p className="mt-1 text-sm text-muted">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 md:mt-10 md:gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="eyebrow !mb-4">Items</h3>
          <ul className="space-y-4">
            {order.items?.map((it) => (
              <li key={it.id} className="flex gap-4 border border-line bg-onyx-soft p-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-onyx-raised">
                  <ProductImage src={it.image_url} alt={it.product_name} initial={it.product_name} sizes="64px" />
                </div>
                <div className="flex flex-1 justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                      {it.brand_name}
                    </p>
                    <p className="break-words text-ivory">{it.product_name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {it.size_ml}ml × {it.qty}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-ivory tnum">
                    {formatBDT(it.unit_price * it.qty)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border border-line p-5">
            <h3 className="eyebrow !mb-4">Delivery Address</h3>
            <p className="text-sm text-ivory">{order.recipient}</p>
            <p className="text-sm text-muted">{order.phone}</p>
            <p className="mt-1 break-words text-sm text-muted">
              {order.address_line}, {order.area}, {order.city}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="border border-line bg-onyx-soft p-5 sm:p-6">
            <h3 className="eyebrow !mb-4">Tracking</h3>
            {order.paperfly_tracking_id && (
              <p className="mb-5 text-xs text-muted">
                AWB: <span className="break-all text-gold">{order.paperfly_tracking_id}</span>
              </p>
            )}
            <TrackingTimeline events={events} currentStatus={order.status} />
          </div>

          <div className="mt-6 border border-line p-5 sm:p-6">
            <h3 className="eyebrow !mb-4">Summary</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatBDT(order.subtotal)} />
              <Row label="Delivery" value={order.delivery_fee === 0 ? "Free" : formatBDT(order.delivery_fee)} />
              {order.discount > 0 && <Row label="Discount" value={`− ${formatBDT(order.discount)}`} />}
              {order.gift_wrap_fee > 0 && <Row label="Gift wrap" value={formatBDT(order.gift_wrap_fee)} />}
              {order.loyalty_redeemed > 0 && <Row label="Loyalty" value={`− ${formatBDT(order.loyalty_redeemed)}`} />}
            </dl>
            <div className="mt-3 flex justify-between border-t border-line pt-3">
              <span className="text-sm uppercase tracking-widest text-muted">Total</span>
              <span className="font-display text-2xl text-ivory tnum">{formatBDT(order.total)}</span>
            </div>
          </div>
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
