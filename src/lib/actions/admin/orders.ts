"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { setOrderStatus } from "@/lib/orders";
import { logAudit } from "@/lib/actions/admin/audit";
import type { OrderStatus } from "@/lib/constants";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  await setOrderStatus(orderId, status, note);
  await logAudit(ctx, "order_status", "order", orderId, { status });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

const REFUNDABLE = new Set([
  "paid",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
]);

export async function refundOrder(
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();

  // Idempotency + state guard: only refund a paid-and-not-yet-refunded order.
  const { data: orderRow } = await supabase
    .from("orders")
    .select("status, user_id, promo_code")
    .eq("id", orderId)
    .maybeSingle();
  const order = orderRow as {
    status: string;
    user_id: string | null;
    promo_code: string | null;
  } | null;
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "refunded") return { ok: true }; // already refunded
  if (!REFUNDABLE.has(order.status))
    return { ok: false, error: "This order cannot be refunded." };

  // Restore stock for each line.
  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, qty")
    .eq("order_id", orderId);
  for (const it of (items ?? []) as { variant_id: string | null; qty: number }[]) {
    if (!it.variant_id) continue;
    const { data: v } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", it.variant_id)
      .maybeSingle();
    const stock = (v as { stock: number } | null)?.stock ?? 0;
    await supabase
      .from("product_variants")
      .update({ stock: stock + it.qty })
      .eq("id", it.variant_id);
  }

  // Reverse the net loyalty effect of this order (un-earn + re-credit redeemed).
  if (order.user_id) {
    const { data: txns } = await supabase
      .from("loyalty_transactions")
      .select("points")
      .eq("order_id", orderId);
    const net = ((txns ?? []) as { points: number }[]).reduce(
      (sum, t) => sum + t.points,
      0,
    );
    if (net !== 0) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", order.user_id)
        .maybeSingle();
      const current = (prof as { loyalty_points: number } | null)?.loyalty_points ?? 0;
      await supabase
        .from("profiles")
        .update({ loyalty_points: Math.max(0, current - net) })
        .eq("id", order.user_id);
      await supabase.from("loyalty_transactions").insert({
        user_id: order.user_id,
        order_id: orderId,
        points: -net,
        reason: "Order refunded",
      });
    }
  }

  // Release the promo usage that was counted on payment.
  if (order.promo_code) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("used_count")
      .eq("code", order.promo_code)
      .maybeSingle();
    const used = (promo as { used_count: number } | null)?.used_count ?? 0;
    if (used > 0)
      await supabase
        .from("promo_codes")
        .update({ used_count: used - 1 })
        .eq("code", order.promo_code);
  }

  await setOrderStatus(orderId, "refunded", "Order refunded; stock restored.");
  await logAudit(ctx, "refund", "order", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function addOrderNote(
  orderId: string,
  note: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("orders").update({ admin_notes: note }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
