import Link from "next/link";
import { Package, Sparkles, Heart, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";
import type { Order } from "@/types";

export default async function AccountOverview() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: orders }, { count: orderCount }, { count: wishCount }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("wishlists").select("product_id", { count: "exact", head: true }),
    ]);

  const recent = (orders as unknown as Order[]) ?? [];
  const isAdmin = profile?.role === "admin";

  const stats = [
    { icon: Sparkles, label: "Reward Points", value: profile?.loyalty_points ?? 0, href: "/account/loyalty" },
    { icon: Package, label: "Orders", value: orderCount ?? 0, href: "/account/orders" },
    { icon: Heart, label: "Wishlist", value: wishCount ?? 0, href: "/account/wishlist" },
  ];

  return (
    <div className="space-y-10">
      {isAdmin && (
        <Link
          href="/admin"
          className="group flex flex-col gap-4 border border-gold/40 bg-gold/10 p-6 transition-colors hover:border-gold hover:bg-gold/15 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">Admin access</p>
              <h2 className="mt-1 font-display text-2xl text-ivory">Open Admin Panel</h2>
              <p className="mt-1 text-sm text-muted">
                Manage products, orders, customers, and store settings.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
            Go to /admin{" "}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      )}

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
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-onyx-soft sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5"
                >
                  <div>
                    <p className="text-sm text-ivory">{o.order_no}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
