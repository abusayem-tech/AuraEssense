/**
 * Logistics abstraction (Paperfly). The admin fulfillment flow depends only on
 * this interface, so the real Paperfly API can replace the mock by setting
 * LOGISTICS_PROVIDER=live and implementing PaperflyProvider.
 */

export interface ShipmentInput {
  orderId: string;
  orderNo: string;
  recipient: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  amountToCollect: number;
  weightG: number;
}

export interface ShipmentResult {
  ok: boolean;
  trackingId?: string;
  error?: string;
}

export type DeliveryStatus =
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "failed";

export interface TrackingUpdate {
  trackingId: string;
  status: DeliveryStatus;
}

export interface LogisticsProvider {
  readonly name: string;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
}

import { MockPaperfly } from "./mock-paperfly";
import { PaperflyProvider } from "./paperfly";

let cached: LogisticsProvider | null = null;

export function getLogisticsProvider(): LogisticsProvider {
  if (cached) return cached;
  const provider = process.env.LOGISTICS_PROVIDER ?? "mock";
  cached = provider === "live" ? new PaperflyProvider() : new MockPaperfly();
  return cached;
}
