import { randomUUID } from "crypto";
import type {
  PaymentGateway,
  PaymentSession,
  PaymentSessionInput,
  IpnResult,
} from "./payment-gateway";

/**
 * Mock SSL Commerze gateway. Mimics the real handshake: it "creates a session"
 * and returns a hosted-page URL (our local mock portal). The IPN verification
 * trusts the simulated payload. Swap PAYMENT_PROVIDER=live for the real one.
 */
export class MockSslCommerzeGateway implements PaymentGateway {
  readonly name = "mock-sslcommerz";

  async createSession(input: PaymentSessionInput): Promise<PaymentSession> {
    const transactionId = `MOCK-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const params = new URLSearchParams({
      order: input.orderId,
      tran: transactionId,
      amount: String(input.amount),
    });
    return {
      gatewayUrl: `/checkout/mock-pay?${params.toString()}`,
      transactionId,
    };
  }

  async verifyIpn(payload: Record<string, string>): Promise<IpnResult> {
    const status =
      payload.status === "VALID"
        ? "VALID"
        : payload.status === "CANCELLED"
          ? "CANCELLED"
          : "FAILED";
    return {
      valid: status === "VALID",
      orderId: payload.order ?? "",
      transactionId: payload.tran ?? "",
      status,
    };
  }
}
