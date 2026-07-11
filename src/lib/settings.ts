import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULTS } from "@/lib/constants";

export interface ResolvedSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  freeShipThreshold: number;
  giftWrapFee: number;
  loyaltyEarnRate: number;
  taxRate: number;
  paymentProvider: string;
  logisticsProvider: string;
  lowStockThreshold: number;
  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
}

/** Public store config — service role so guests still resolve fees after RLS lockdown. */
export async function getSettings(): Promise<ResolvedSettings> {
  const supabase = createAdminClient();
  const [{ data: s }, { data: zones }] = await Promise.all([
    supabase.from("store_settings").select("*").maybeSingle(),
    supabase.from("shipping_zones").select("*"),
  ]);

  const dhaka = (zones ?? []).find(
    (z) => (z as { zone: string }).zone === "dhaka",
  ) as { fee_bdt: number } | undefined;
  const outside = (zones ?? []).find(
    (z) => (z as { zone: string }).zone === "outside",
  ) as { fee_bdt: number } | undefined;

  const row = s as Record<string, number | string> | null;

  return {
    storeName: (row?.store_name as string) ?? "AuraEssence",
    contactEmail: (row?.contact_email as string) ?? "concierge@auraessence.com",
    contactPhone: (row?.contact_phone as string) ?? "+880 1700-000000",
    freeShipThreshold:
      (row?.free_ship_threshold as number) ?? DEFAULTS.freeShipThreshold,
    giftWrapFee: (row?.gift_wrap_fee as number) ?? DEFAULTS.giftWrapFee,
    loyaltyEarnRate: (row?.loyalty_earn_rate as number) ?? DEFAULTS.loyaltyEarnRate,
    taxRate: (row?.tax_rate as number) ?? 0,
    paymentProvider: (row?.payment_provider as string) ?? "mock",
    logisticsProvider: (row?.logistics_provider as string) ?? "mock",
    lowStockThreshold:
      (row?.low_stock_threshold as number) ?? DEFAULTS.lowStockThreshold,
    deliveryFeeDhaka: dhaka?.fee_bdt ?? DEFAULTS.deliveryFeeDhaka,
    deliveryFeeOutside: outside?.fee_bdt ?? DEFAULTS.deliveryFeeOutside,
  };
}
