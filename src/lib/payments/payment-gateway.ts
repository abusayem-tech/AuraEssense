/**
 * Payment gateway abstraction. The storefront depends only on this interface,
 * so a real SSL Commerze integration can replace the mock without touching
 * any business logic — just swap the factory below (driven by PAYMENT_PROVIDER).
 */

export interface PaymentSessionInput {
  orderId: string;
  orderNo: string;
  amount: number; // BDT
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentSession {
  /** URL to redirect the customer to (hosted payment page). */
  gatewayUrl: string;
  /** Provider transaction id. */
  transactionId: string;
}

export type IpnStatus = "VALID" | "FAILED" | "CANCELLED";

export interface IpnResult {
  valid: boolean;
  orderId: string;
  transactionId: string;
  status: IpnStatus;
}

export interface PaymentGateway {
  readonly name: string;
  createSession(input: PaymentSessionInput): Promise<PaymentSession>;
  verifyIpn(payload: Record<string, string>): Promise<IpnResult>;
}

import { MockSslCommerzeGateway } from "./mock-sslcommerz";
import { SslCommerzeGateway } from "./sslcommerz";

let cached: PaymentGateway | null = null;

export function getPaymentGateway(): PaymentGateway {
  if (cached) return cached;
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";
  cached = provider === "live" ? new SslCommerzeGateway() : new MockSslCommerzeGateway();
  return cached;
}
