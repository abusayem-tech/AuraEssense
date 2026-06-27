"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderFromCart, markOrderPaid, setOrderStatus } from "@/lib/orders";
import { getPaymentGateway } from "@/lib/payments/payment-gateway";

const lineSchema = z.object({ variantId: z.string().uuid(), qty: z.number().min(1) });

const checkoutSchema = z.object({
  recipient: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  addressLine: z.string().min(4),
  area: z.string().min(2),
  city: z.string().min(2),
  zone: z.enum(["dhaka", "outside"]),
  promoCode: z.string().optional(),
  giftCardCode: z.string().optional(),
  giftWrap: z.boolean().optional(),
  giftMessage: z.string().optional(),
  redeemLoyalty: z.boolean().optional(),
  lines: z.array(lineSchema).min(1),
});

export type CheckoutFormInput = z.infer<typeof checkoutSchema>;

export async function placeOrder(
  input: CheckoutFormInput,
): Promise<{ ok: boolean; gatewayUrl?: string; error?: string }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Please complete all required fields." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const created = await createOrderFromCart({
    userId: user?.id ?? null,
    ...parsed.data,
  });

  if (!created.ok || !created.orderId)
    return { ok: false, error: created.error ?? "Could not place order." };

  // If total is zero (fully covered by gift card/loyalty), mark paid directly.
  if ((created.total ?? 0) <= 0) {
    await markOrderPaid(created.orderId, "FREE-0");
    return { ok: true, gatewayUrl: `/checkout/success?order=${created.orderId}` };
  }

  const gateway = getPaymentGateway();
  const session = await gateway.createSession({
    orderId: created.orderId,
    orderNo: created.orderNo ?? "",
    amount: created.total ?? 0,
    customerName: parsed.data.recipient,
    customerEmail: parsed.data.email,
    customerPhone: parsed.data.phone,
  });

  // Persist transaction id reference.
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ ssl_transaction_id: session.transactionId })
    .eq("id", created.orderId);

  return { ok: true, gatewayUrl: session.gatewayUrl };
}

/**
 * Simulates the SSL Commerze outcome for the mock hosted page. In production
 * this path is replaced by the gateway's real IPN webhook to /api/webhooks.
 */
export async function simulatePayment(
  orderId: string,
  transactionId: string,
  outcome: "success" | "fail" | "cancel",
): Promise<{ redirect: string }> {
  if (outcome === "success") {
    await markOrderPaid(orderId, transactionId);
    return { redirect: `/checkout/success?order=${orderId}` };
  }
  if (outcome === "cancel") {
    await setOrderStatus(orderId, "cancelled", "Payment cancelled by customer.");
    return { redirect: `/checkout/cancel?order=${orderId}` };
  }
  await setOrderStatus(orderId, "failed", "Payment failed.");
  return { redirect: `/checkout/fail?order=${orderId}` };
}

/** Live promo/gift preview for the checkout summary. */
export async function previewDiscount(
  code: string,
  subtotal: number,
): Promise<{ ok: boolean; type?: string; amount?: number; message: string }> {
  const supabase = await createClient();
  const upper = code.toUpperCase();

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", upper)
    .eq("active", true)
    .maybeSingle();
  const p = promo as {
    type: string;
    value: number;
    min_order: number;
    expires_at: string | null;
  } | null;

  if (p) {
    if (subtotal < p.min_order)
      return { ok: false, message: `Minimum order ৳${p.min_order} required.` };
    if (p.expires_at && new Date(p.expires_at) < new Date())
      return { ok: false, message: "This code has expired." };
    const amount =
      p.type === "percent"
        ? Math.round((subtotal * p.value) / 100)
        : p.type === "fixed"
          ? p.value
          : 0;
    return {
      ok: true,
      type: p.type,
      amount,
      message:
        p.type === "free_ship"
          ? "Free shipping applied."
          : `Discount applied: ৳${amount}.`,
    };
  }

  const { data: gc } = await supabase
    .from("gift_cards")
    .select("balance, status")
    .eq("code", upper)
    .maybeSingle();
  const card = gc as { balance: number; status: string } | null;
  if (card && card.status === "active" && card.balance > 0) {
    return {
      ok: true,
      type: "gift_card",
      amount: card.balance,
      message: `Gift card balance ৳${card.balance} available.`,
    };
  }

  return { ok: false, message: "Invalid or expired code." };
}
