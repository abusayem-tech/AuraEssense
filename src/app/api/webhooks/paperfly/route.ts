import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setOrderStatus } from "@/lib/orders";

const STATUS_MAP: Record<string, "in_transit" | "delivered" | "failed"> = {
  picked: "in_transit",
  in_transit: "in_transit",
  on_the_way: "in_transit",
  delivered: "delivered",
  returned: "failed",
};

/**
 * Paperfly delivery status webhook (REQ-10). Maps the provider status to our
 * order status and records a tracking event.
 */
export async function POST(request: Request) {
  // Authenticate the caller with a shared secret before mutating any order.
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: Record<string, string> = {};
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) payload = await request.json();
    else {
      const form = await request.formData();
      form.forEach((v, k) => (payload[k] = String(v)));
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const trackingId = payload.tracking_id || payload.trackingId;
  const rawStatus = (payload.status || "").toLowerCase();
  if (!trackingId) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("paperfly_tracking_id", trackingId)
    .maybeSingle();
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });

  const mapped = STATUS_MAP[rawStatus];
  if (mapped)
    await setOrderStatus(
      (order as { id: string }).id,
      mapped,
      `Paperfly: ${rawStatus.replace("_", " ")}`,
    );

  return NextResponse.json({ ok: true });
}
