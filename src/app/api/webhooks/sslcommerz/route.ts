import { NextResponse } from "next/server";
import { getPaymentGateway } from "@/lib/payments/payment-gateway";
import { markOrderPaid, setOrderStatus } from "@/lib/orders";

/**
 * SSL Commerze IPN (Instant Payment Notification) handler.
 * On a VALID transaction the order is marked paid and stock decremented (REQ-8).
 */
export async function POST(request: Request) {
  // Authenticate the caller with a shared secret. In live mode the gateway's
  // verifyIpn must additionally perform real signature + amount validation.
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, string> = {};
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((v, k) => (payload[k] = String(v)));
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const gateway = getPaymentGateway();
  const result = await gateway.verifyIpn(payload);

  if (!result.orderId) {
    return NextResponse.json({ ok: false, error: "Missing order" }, { status: 400 });
  }

  if (result.valid) {
    await markOrderPaid(result.orderId, result.transactionId);
  } else if (result.status === "CANCELLED") {
    await setOrderStatus(result.orderId, "cancelled", "Payment cancelled.");
  } else {
    await setOrderStatus(result.orderId, "failed", "Payment failed.");
  }

  return NextResponse.json({ ok: true });
}
