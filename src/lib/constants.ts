export const SITE = {
  name: "AuraEssence",
  tagline: "The Art of Luxury Fragrance",
  description:
    "AuraEssence is a curated house of luxury perfumes and niche fragrances, delivered across Bangladesh. Discover your signature scent.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "concierge@auraessence.com",
  phone: "+880 1700-000000",
  address: "Gulshan Avenue, Dhaka 1212, Bangladesh",
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    pinterest: "https://pinterest.com",
  },
};

export const GENDERS = ["men", "women", "unisex"] as const;
export const CONCENTRATIONS = ["Parfum", "EDP", "EDT", "EDC"] as const;
export const SEASONS = ["Spring", "Summer", "Autumn", "Winter"] as const;
export const OCCASIONS = ["Daily", "Office", "Evening", "Date", "Special"] as const;

export const CONCENTRATION_LABELS: Record<string, string> = {
  Parfum: "Parfum (20-30%)",
  EDP: "Eau de Parfum (15-20%)",
  EDT: "Eau de Toilette (5-15%)",
  EDC: "Eau de Cologne (2-4%)",
};

export const MAIN_NAV = [
  { label: "Fragrances", href: "/fragrances" },
  { label: "Brands", href: "/brands" },
  { label: "Collections", href: "/collections" },
  { label: "Scent Quiz", href: "/quiz" },
  { label: "Journal", href: "/journal" },
] as const;

export const FOOTER_NAV = {
  Shop: [
    { label: "All Fragrances", href: "/fragrances" },
    { label: "For Him", href: "/fragrances?gender=men" },
    { label: "For Her", href: "/fragrances?gender=women" },
    { label: "Unisex", href: "/fragrances?gender=unisex" },
    { label: "Discovery Samples", href: "/fragrances?samples=1" },
  ],
  House: [
    { label: "Our Story", href: "/about" },
    { label: "The Journal", href: "/journal" },
    { label: "Collections", href: "/collections" },
    { label: "Scent Quiz", href: "/quiz" },
  ],
  Care: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Track Order", href: "/account/orders" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export const ORDER_STATUS = [
  "pending",
  "paid",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: string }
> = {
  pending: { label: "Pending Payment", tone: "text-muted" },
  paid: { label: "Paid", tone: "text-emerald" },
  processing: { label: "Processing", tone: "text-gold" },
  dispatched: { label: "Dispatched", tone: "text-gold" },
  in_transit: { label: "In Transit", tone: "text-gold-soft" },
  delivered: { label: "Delivered", tone: "text-emerald" },
  cancelled: { label: "Cancelled", tone: "text-rose" },
  failed: { label: "Payment Failed", tone: "text-rose" },
  refunded: { label: "Refunded", tone: "text-rose" },
};

/** Loyalty & commerce defaults (overridable via store_settings). */
export const DEFAULTS = {
  freeShipThreshold: 8000,
  deliveryFeeDhaka: 80,
  deliveryFeeOutside: 150,
  giftWrapFee: 250,
  loyaltyEarnRate: 0.02, // 2% of paid total -> points (1 point = 1 BDT)
  lowStockThreshold: 5,
};
