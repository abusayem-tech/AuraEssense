import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CartClearer } from "@/components/checkout/cart-clearer";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBDT } from "@/lib/format";
import type { Order, OrderItem } from "@/types";

export const metadata = { title: "Order Confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  let order: (Order & { items?: OrderItem[] }) | null = null;

  if (orderId) {
    // The order id (an unguessable UUID) is the access token here, so we read
    // via the service-role client to also show guest orders on confirmation.
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    order = (data as unknown as Order) ?? null;
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-24">
      <CartClearer />
      <div className="w-full max-w-lg text-center">
        <CheckCircle2 className="mx-auto text-emerald" size={56} />
        <p className="eyebrow mt-6">Thank You</p>
        <h1 className="mt-3 font-display text-4xl text-ivory sm:text-5xl">
          Order Confirmed
        </h1>
        {order ? (
          <>
            <p className="mt-4 text-ivory-dim">
              Your order{" "}
              <span className="text-gold">{order.order_no}</span> has been
              received and is being prepared with care.
            </p>
            <div className="mt-8 border border-line bg-onyx-soft p-6 text-left">
              <ul className="space-y-3">
                {order.items?.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4 text-sm">
                    <span className="break-words text-ivory-dim">
                      {it.product_name} · {it.size_ml}ml × {it.qty}
                    </span>
                    <span className="shrink-0 text-ivory tnum">
                      {formatBDT(it.unit_price * it.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-line pt-4">
                <span className="text-sm uppercase tracking-widest text-muted">
                  Total Paid
                </span>
                <span className="font-display text-2xl text-ivory tnum">
                  {formatBDT(order.total)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-ivory-dim">
            Your payment was successful. A confirmation has been sent to your
            email.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/account/orders">
              <Package size={15} /> Track Your Order
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/fragrances">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
