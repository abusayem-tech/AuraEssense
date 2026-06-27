import { randomUUID } from "crypto";
import type {
  LogisticsProvider,
  ShipmentInput,
  ShipmentResult,
} from "./logistics-provider";

/**
 * Mock Paperfly provider. Generates an Air Waybill (AWB) tracking number and
 * succeeds. A simulated failure can be forced for testing the retry/queue path
 * by setting input.orderNo to include "FAILTEST".
 */
export class MockPaperfly implements LogisticsProvider {
  readonly name = "mock-paperfly";

  async createShipment(input: ShipmentInput): Promise<ShipmentResult> {
    if (input.orderNo.includes("FAILTEST")) {
      return { ok: false, error: "Paperfly API unreachable (simulated)." };
    }
    const trackingId = `PF${Date.now().toString().slice(-8)}${randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;
    return { ok: true, trackingId };
  }
}
