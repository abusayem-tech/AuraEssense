"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { setOrderStatus } from "@/lib/orders";
import { getLogisticsProvider } from "@/lib/logistics/logistics-provider";
import { logAudit } from "@/lib/actions/admin/audit";

/** One-click push to Paperfly (REQ-9), with retry/queue on failure (3.3.3). */
export async function pushToPaperfly(
  orderId: string,
): Promise<{ ok: boolean; trackingId?: string; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };

  const o = order as Record<string, string | number | null>;

  if (o.paperfly_tracking_id)
    return { ok: true, trackingId: String(o.paperfly_tracking_id) };

  const provider = getLogisticsProvider();
  const result = await provider.createShipment({
    orderId,
    orderNo: String(o.order_no),
    recipient: String(o.recipient),
    phone: String(o.phone),
    address: String(o.address_line),
    area: String(o.area),
    city: String(o.city),
    amountToCollect: 0,
    weightG: 500,
  });

  if (!result.ok || !result.trackingId) {
    // Queue for retry: increment attempts, notify admin.
    await supabase
      .from("orders")
      .update({ paperfly_attempts: Number(o.paperfly_attempts ?? 0) + 1 })
      .eq("id", orderId);
    await supabase.from("admin_notifications").insert({
      type: "dispatch_failed",
      title: "Paperfly dispatch failed",
      body: `Order ${o.order_no}: ${result.error}. Queued for retry.`,
      link: `/admin/orders/${orderId}`,
    });
    return { ok: false, error: result.error ?? "Dispatch failed." };
  }

  await supabase
    .from("orders")
    .update({ paperfly_tracking_id: result.trackingId, status: "dispatched" })
    .eq("id", orderId);
  await supabase.from("order_events").insert({
    order_id: orderId,
    status: "dispatched",
    note: `Dispatched via Paperfly. AWB ${result.trackingId}.`,
  });
  await logAudit(ctx, "dispatch", "order", orderId, {
    trackingId: result.trackingId,
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, trackingId: result.trackingId };
}

/** Simulate the next Paperfly tracking status (mock of the status webhook). */
export async function advanceTracking(
  orderId: string,
): Promise<{ ok: boolean; status?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false };

  const flow: Record<string, string> = {
    dispatched: "in_transit",
    in_transit: "delivered",
  };
  const next = flow[(order as { status: string }).status];
  if (!next) return { ok: false };

  await setOrderStatus(
    orderId,
    next as "in_transit" | "delivered",
    `Tracking update: ${next.replace("_", " ")}.`,
  );
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, status: next };
}
