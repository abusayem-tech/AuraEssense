import type { Product, ProductVariant } from "@/types";

/** Effective price for a variant (sale price if present). */
export function variantPrice(v: ProductVariant): number {
  return v.sale_price_bdt ?? v.price_bdt;
}

export function isOnSale(v: ProductVariant): boolean {
  return v.sale_price_bdt != null && v.sale_price_bdt < v.price_bdt;
}

export function discountPercent(v: ProductVariant): number {
  if (!isOnSale(v)) return 0;
  return Math.round((1 - (v.sale_price_bdt as number) / v.price_bdt) * 100);
}

/** The default (full-bottle, lowest non-sample) variant used for card display. */
export function defaultVariant(product: Product): ProductVariant | undefined {
  const variants = product.variants ?? [];
  const full = variants
    .filter((v) => !v.is_sample)
    .sort((a, b) => a.size_ml - b.size_ml);
  return full[0] ?? variants[0];
}

/** Lowest effective price across a products variants (the "from" price). */
export function fromPrice(product: Product): number {
  const variants = product.variants ?? [];
  if (variants.length === 0) return 0;
  return Math.min(...variants.map(variantPrice));
}

export function totalStock(product: Product): number {
  return (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  giftWrapFee: number;
  loyaltyRedeemed: number;
  total: number;
}

export function computeTotals(opts: {
  subtotal: number;
  zone: "dhaka" | "outside";
  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
  freeShipThreshold: number;
  discount?: number;
  freeShip?: boolean;
  giftWrap?: boolean;
  giftWrapFee?: number;
  loyaltyRedeemed?: number;
}): CartTotals {
  const {
    subtotal,
    zone,
    deliveryFeeDhaka,
    deliveryFeeOutside,
    freeShipThreshold,
    discount = 0,
    freeShip = false,
    giftWrap = false,
    giftWrapFee = 0,
    loyaltyRedeemed = 0,
  } = opts;

  const baseFee = zone === "dhaka" ? deliveryFeeDhaka : deliveryFeeOutside;
  const qualifiesFree = subtotal >= freeShipThreshold || freeShip;
  const deliveryFee = qualifiesFree ? 0 : baseFee;
  const wrap = giftWrap ? giftWrapFee : 0;

  const total = Math.max(
    0,
    subtotal + deliveryFee + wrap - discount - loyaltyRedeemed,
  );

  return {
    subtotal,
    deliveryFee,
    discount,
    giftWrapFee: wrap,
    loyaltyRedeemed,
    total,
  };
}
