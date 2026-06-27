import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order, OrderItem } from "@/types";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });
  const orders = (data as unknown as (Order & { items: OrderItem[] })[]) ?? [];

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={36} />}
        title="No orders yet"
        description="When you place an order, it will appear here for tracking."
        action={
          <Button asChild>
            <Link href="/fragrances">Explore Fragrances</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl text-ivory">Order History</h2>
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/account/orders/${o.id}`}
          className="block border border-line bg-onyx-soft p-6 transition-colors hover:border-gold"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg text-ivory">{o.order_no}</p>
              <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
            </div>
            <OrderStatusBadge status={o.status} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <p className="text-sm text-muted">
              {o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? "" : "s"}
              {o.paperfly_tracking_id ? ` · AWB ${o.paperfly_tracking_id}` : ""}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ivory tnum">{formatBDT(o.total)}</span>
              <ArrowRight size={15} className="text-gold" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
