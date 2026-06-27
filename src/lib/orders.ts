import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/settings";
import { computeTotals } from "@/lib/pricing";
import type { OrderStatus } from "@/lib/constants";

export interface CheckoutLineInput {
  variantId: string;
  qty: number;
}

export interface CheckoutInput {
  userId: string | null;
  lines: CheckoutLineInput[];
  recipient: string;
  phone: string;
  email: string;
  addressLine: string;
  area: string;
  city: string;
  zone: "dhaka" | "outside";
  promoCode?: string;
  giftCardCode?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  redeemLoyalty?: boolean;
}

export interface CreatedOrder {
  ok: boolean;
  orderId?: string;
  orderNo?: string;
  total?: number;
  error?: string;
}

/**
 * Authoritative order creation. Prices, stock and discounts are validated
 * server-side against the database — client-supplied prices are never trusted.
 */
export async function createOrderFromCart(
  input: CheckoutInput,
): Promise<CreatedOrder> {
  const supabase = createAdminClient();
  const settings = await getSettings();

  if (!input.lines.length) return { ok: false, error: "Your bag is empty." };

  // Load authoritative variant data.
  const variantIds = input.lines.map((l) => l.variantId);
  const { data: variants } = await supabase
    .from("product_variants")
    .select(
      "id, size_ml, sku, price_bdt, sale_price_bdt, stock, is_sample, product:products(id, name, slug, brand:brands(name), images:product_images(url, position))",
    )
    .in("id", variantIds);

  if (!variants || variants.length === 0)
    return { ok: false, error: "Items are no longer available." };

  type VRow = {
    id: string;
    size_ml: number;
    sku: string;
    price_bdt: number;
    sale_price_bdt: number | null;
    stock: number;
    is_sample: boolean;
    product: {
      id: string;
      name: string;
      brand: { name: string } | null;
      images: { url: string; position: number }[];
    } | null;
  };
  const vmap = new Map((variants as unknown as VRow[]).map((v) => [v.id, v]));

  let subtotal = 0;
  const items: Array<{
    product_id: string | null;
    variant_id: string;
    product_name: string;
    brand_name: string | null;
    size_ml: number;
    sku: string;
    unit_price: number;
    qty: number;
    image_url: string | null;
  }> = [];

  for (const line of input.lines) {
    const v = vmap.get(line.variantId);
    if (!v) return { ok: false, error: "An item is unavailable." };
    if (v.stock < line.qty)
      return {
        ok: false,
        error: `Insufficient stock for ${v.product?.name ?? "an item"}.`,
      };
    const price = v.sale_price_bdt ?? v.price_bdt;
    subtotal += price * line.qty;
    const img = v.product?.images?.sort((a, b) => a.position - b.position)[0]?.url ?? null;
    items.push({
      product_id: v.product?.id ?? null,
      variant_id: v.id,
      product_name: v.product?.name ?? "Fragrance",
      brand_name: v.product?.brand?.name ?? null,
      size_ml: v.size_ml,
      sku: v.sku,
      unit_price: price,
      qty: line.qty,
      image_url: img,
    });
  }

  // Promo code.
  let discount = 0;
  let freeShip = false;
  let appliedPromo: string | null = null;
  if (input.promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", input.promoCode.toUpperCase())
      .eq("active", true)
      .maybeSingle();
    const p = promo as {
      code: string;
      type: string;
      value: number;
      min_order: number;
      usage_limit: number | null;
      used_count: number;
      expires_at: string | null;
    } | null;
    if (
      p &&
      subtotal >= p.min_order &&
      (!p.expires_at || new Date(p.expires_at) > new Date()) &&
      (p.usage_limit == null || p.used_count < p.usage_limit)
    ) {
      appliedPromo = p.code;
      if (p.type === "percent") discount = Math.round((subtotal * p.value) / 100);
      else if (p.type === "fixed") discount = p.value;
      else if (p.type === "free_ship") freeShip = true;
    }
  }

  // Gift card (applied as discount against total).
  let giftCardCode: string | null = null;
  let giftCardAmount = 0;
  if (input.giftCardCode) {
    const { data: gc } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("code", input.giftCardCode.toUpperCase())
      .eq("status", "active")
      .maybeSingle();
    const card = gc as { code: string; balance: number } | null;
    if (card && card.balance > 0) {
      giftCardCode = card.code;
      giftCardAmount = card.balance;
    }
  }

  // Loyalty redemption.
  let loyaltyRedeemed = 0;
  if (input.redeemLoyalty && input.userId) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("loyalty_points")
      .eq("id", input.userId)
      .maybeSingle();
    loyaltyRedeemed = Math.max(
      0,
      (prof as { loyalty_points: number } | null)?.loyalty_points ?? 0,
    );
  }

  const totals = computeTotals({
    subtotal,
    zone: input.zone,
    deliveryFeeDhaka: settings.deliveryFeeDhaka,
    deliveryFeeOutside: settings.deliveryFeeOutside,
    freeShipThreshold: settings.freeShipThreshold,
    discount,
    freeShip,
    giftWrap: input.giftWrap,
    giftWrapFee: settings.giftWrapFee,
    loyaltyRedeemed: 0, // applied below after gift card
  });

  // Apply gift card and loyalty against the remaining total.
  let remaining = totals.total;
  const giftApplied = Math.min(giftCardAmount, remaining);
  remaining -= giftApplied;
  const loyaltyApplied = Math.min(loyaltyRedeemed, remaining);
  remaining -= loyaltyApplied;

  const finalTotal = remaining;

  // Insert order.
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      status: "pending",
      subtotal,
      delivery_fee: totals.deliveryFee,
      discount: discount + giftApplied,
      gift_wrap_fee: totals.giftWrapFee,
      loyalty_redeemed: loyaltyApplied,
      total: finalTotal,
      promo_code: appliedPromo,
      is_gift: !!input.giftWrap,
      gift_message: input.giftMessage ?? null,
      recipient: input.recipient,
      phone: input.phone,
      email: input.email,
      address_line: input.addressLine,
      area: input.area,
      city: input.city,
      zone: input.zone,
    })
    .select("id, order_no")
    .single();

  if (orderErr || !order)
    return { ok: false, error: "Could not create order. Please try again." };

  const orderRow = order as { id: string; order_no: string };

  await supabase.from("order_items").insert(
    items.map((it) => ({ ...it, order_id: orderRow.id })),
  );
  await supabase.from("order_events").insert({
    order_id: orderRow.id,
    status: "pending",
    note: "Order placed, awaiting payment.",
  });

  // Stash applied gift card / loyalty for settlement on payment success in a
  // dedicated column (kept separate from human-facing admin_notes).
  await supabase
    .from("orders")
    .update({
      settlement_memo: { giftCardCode, giftApplied, loyaltyApplied },
    })
    .eq("id", orderRow.id);

  return {
    ok: true,
    orderId: orderRow.id,
    orderNo: orderRow.order_no,
    total: finalTotal,
  };
}

/** Mark an order paid: decrement stock, settle gift card/loyalty, award points. */
export async function markOrderPaid(orderId: string, transactionId: string) {
  const supabase = createAdminClient();
  const settings = await getSettings();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;
  const o = order as Record<string, unknown> & {
    status: string;
    user_id: string | null;
    subtotal: number;
    total: number;
    promo_code: string | null;
    settlement_memo: {
      giftCardCode?: string | null;
      giftApplied?: number;
      loyaltyApplied?: number;
    } | null;
    items: Array<{ variant_id: string | null; qty: number }>;
  };
  if (o.status === "paid") return; // fast-path idempotency

  // Atomic transition: only one concurrent caller (e.g. retried IPN) can flip
  // pending -> paid, preventing double stock/loyalty/promo settlement.
  const { data: claimed } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      ssl_transaction_id: transactionId,
      settlement_memo: null,
    })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id");
  if (!claimed || claimed.length === 0) return; // already settled by another call

  await supabase.from("order_events").insert({
    order_id: orderId,
    status: "paid",
    note: `Payment confirmed (${transactionId}).`,
  });

  // Decrement stock.
  for (const it of o.items) {
    if (it.variant_id)
      await supabase.rpc("decrement_variant_stock", {
        p_variant: it.variant_id,
        p_qty: it.qty,
        p_order: orderId,
      });
  }

  // Settle gift card + loyalty redemption from the settlement memo.
  try {
    const memo = o.settlement_memo;
    if (memo?.giftCardCode && (memo.giftApplied ?? 0) > 0) {
      const { data: gc } = await supabase
        .from("gift_cards")
        .select("balance")
        .eq("code", memo.giftCardCode)
        .maybeSingle();
      const bal = (gc as { balance: number } | null)?.balance ?? 0;
      const newBal = Math.max(0, bal - (memo.giftApplied ?? 0));
      await supabase
        .from("gift_cards")
        .update({ balance: newBal, status: newBal === 0 ? "depleted" : "active" })
        .eq("code", memo.giftCardCode);
    }
    if (o.user_id && (memo?.loyaltyApplied ?? 0) > 0) {
      await supabase.from("loyalty_transactions").insert({
        user_id: o.user_id,
        order_id: orderId,
        points: -(memo!.loyaltyApplied ?? 0),
        reason: "Redeemed at checkout",
      });
      await adjustLoyalty(o.user_id, -(memo!.loyaltyApplied ?? 0));
    }
  } catch {
    /* ignore settlement errors */
  }

  // Increment promo usage.
  if (o.promo_code) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("used_count")
      .eq("code", o.promo_code)
      .maybeSingle();
    if (promo)
      await supabase
        .from("promo_codes")
        .update({ used_count: ((promo as { used_count: number }).used_count ?? 0) + 1 })
        .eq("code", o.promo_code);
  }

  // Award loyalty points on the merchandise subtotal (not shipping/gift wrap).
  if (o.user_id) {
    const earned = Math.round(o.subtotal * settings.loyaltyEarnRate);
    if (earned > 0) {
      await supabase.from("loyalty_transactions").insert({
        user_id: o.user_id,
        order_id: orderId,
        points: earned,
        reason: "Earned on purchase",
      });
      await adjustLoyalty(o.user_id, earned);
    }
  }

  // Admin notification.
  await supabase.from("admin_notifications").insert({
    type: "new_order",
    title: "New paid order",
    body: `Order ${(o as { order_no?: string }).order_no ?? orderId} has been paid.`,
    link: `/admin/orders/${orderId}`,
  });
}

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  const supabase = createAdminClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);
  await supabase.from("order_events").insert({ order_id: orderId, status, note });
}

async function adjustLoyalty(userId: string, delta: number) {
  const supabase = createAdminClient();
  const { data: prof } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", userId)
    .maybeSingle();
  const current = (prof as { loyalty_points: number } | null)?.loyalty_points ?? 0;
  await supabase
    .from("profiles")
    .update({ loyalty_points: Math.max(0, current + delta) })
    .eq("id", userId);
}
