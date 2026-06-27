import type {
  LogisticsProvider,
  ShipmentInput,
  ShipmentResult,
} from "./logistics-provider";

/**
 * Real Paperfly provider — stub left ready for production credentials.
 * Implement createShipment to POST order details to the Paperfly Order Place
 * API and return the tracking number. Docs from Paperfly integration team.
 */
export class PaperflyProvider implements LogisticsProvider {
  readonly name = "paperfly";

  private apiKey = process.env.PAPERFLY_API_KEY ?? "";

  async createShipment(_input: ShipmentInput): Promise<ShipmentResult> {
    void this.apiKey;
    return {
      ok: false,
      error:
        "PaperflyProvider.createShipment not implemented. Set LOGISTICS_PROVIDER=mock or implement the live integration.",
    };
  }
}
