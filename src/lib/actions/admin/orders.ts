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

export async function refundOrder(orderId: string): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();

  // Restore stock for refunded items.
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

  await setOrderStatus(orderId, "refunded", "Order refunded; stock restored.");
  await logAudit(ctx, "refund", "order", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
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
