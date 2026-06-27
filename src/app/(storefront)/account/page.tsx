import Link from "next/link";
import { Package, Sparkles, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order } from "@/types";

export default async function AccountOverview() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: orders }, { count: wishCount }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("wishlists")
      .select("product_id", { count: "exact", head: true }),
  ]);

  const recent = (orders as unknown as Order[]) ?? [];

  const stats = [
    { icon: Sparkles, label: "Reward Points", value: profile?.loyalty_points ?? 0, href: "/account/loyalty" },
    { icon: Package, label: "Orders", value: recent.length, href: "/account/orders" },
    { icon: Heart, label: "Wishlist", value: wishCount ?? 0, href: "/account/wishlist" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group border border-line bg-onyx-soft p-6 transition-colors hover:border-gold"
          >
            <s.icon size={20} className="text-gold" />
            <p className="mt-4 font-display text-3xl text-ivory tnum">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ivory">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs uppercase tracking-widest text-gold">
            View All
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="border border-line p-10 text-center">
            <p className="text-muted">You haven&apos;t placed any orders yet.</p>
            <Button asChild className="mt-5">
              <Link href="/fragrances">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line border border-line">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-onyx-soft"
                >
                  <div>
                    <p className="text-sm text-ivory">{o.order_no}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm text-ivory tnum">
                      {formatBDT(o.total)}
                    </span>
                    <ArrowRight size={15} className="text-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
