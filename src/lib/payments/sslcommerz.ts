import type {
  PaymentGateway,
  PaymentSession,
  PaymentSessionInput,
  IpnResult,
} from "./payment-gateway";

/**
 * Real SSL Commerze gateway — stub left ready for production credentials.
 * Implement createSession (POST to the SSLCommerz session API) and verifyIpn
 * (validate the IPN payload + hash against SSLCOMMERZ_STORE_PASSWORD) here.
 * Docs: https://developer.sslcommerz.com/
 */
export class SslCommerzeGateway implements PaymentGateway {
  readonly name = "sslcommerz";

  private storeId = process.env.SSLCOMMERZ_STORE_ID ?? "";
  private storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD ?? "";
  private sandbox = process.env.SSLCOMMERZ_SANDBOX !== "false";

  async createSession(_input: PaymentSessionInput): Promise<PaymentSession> {
    void this.storeId;
    void this.storePassword;
    void this.sandbox;
    throw new Error(
      "SslCommerzeGateway.createSession not implemented. Set PAYMENT_PROVIDER=mock or implement the live integration.",
    );
  }

  async verifyIpn(_payload: Record<string, string>): Promise<IpnResult> {
    throw new Error("SslCommerzeGateway.verifyIpn not implemented.");
  }
}
