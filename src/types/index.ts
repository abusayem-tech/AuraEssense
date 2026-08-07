import type { OrderStatus } from "@/lib/constants";

export type Gender = "men" | "women" | "unisex";
export type Concentration = "Parfum" | "EDP" | "EDT" | "EDC";
export type Role = "customer" | "admin";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logo_url: string | null;
  description: string | null;
  hero_image: string | null;
  product_count?: number;
}

export interface FragranceFamily {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent_color: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_ml: number;
  sku: string;
  price_bdt: number;
  sale_price_bdt: number | null;
  stock: number;
  is_sample: boolean;
}

export interface Product {
  id: string;
  sku_base: string;
  slug: string;
  name: string;
  brand_id: string;
  family_id: string | null;
  gender: Gender;
  concentration: Concentration;
  description: string | null;
  story: string | null;
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
  season: string[];
  occasion: string[];
  longevity: number;
  sillage: number;
  weight_g: number;
  is_active: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  // joins
  brand?: Brand;
  family?: FragranceFamily;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  cover_image: string | null;
  is_featured: boolean;
  position: number;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
  loyalty_points: number;
  is_blocked: boolean;
  notes: string | null;
  created_at: string;
  updated_at?: string;
  email?: string;
}

export interface Address {
  id: string;
  user_id: string;
  recipient: string;
  phone: string;
  line: string;
  area: string;
  city: string;
  zone: "dhaka" | "outside";
  is_default: boolean;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  qty: number;
  variant?: ProductVariant & { product?: Product };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  brand_name: string | null;
  size_ml: number;
  sku: string;
  unit_price: number;
  qty: number;
  image_url: string | null;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_no: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  gift_wrap_fee: number;
  loyalty_redeemed: number;
  total: number;
  promo_code: string | null;
  is_gift: boolean;
  gift_message: string | null;
  ssl_transaction_id: string | null;
  paperfly_tracking_id: string | null;
  paperfly_attempts: number;
  admin_notes: string | null;
  recipient: string;
  phone: string;
  address_line: string;
  area: string;
  city: string;
  zone: "dhaka" | "outside";
  email: string | null;
  created_at: string;
  paid_at: string | null;
  // joins
  items?: OrderItem[];
  events?: OrderEvent[];
  profile?: Profile;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  photo_urls: string[];
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  created_at: string;
  author_name?: string;
  product_name?: string;
  viewer_voted?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_ship";
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

export interface GiftCard {
  id: string;
  code: string;
  initial_amount: number;
  balance: number;
  status: "active" | "depleted" | "disabled";
  created_at: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  body: string;
  author: string;
  published_at: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  position: number;
  prompt: string;
  subtitle: string | null;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  description: string | null;
  image: string | null;
  family_weights: Record<string, number>;
  note_weights: Record<string, number>;
  position: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  zone: "dhaka" | "outside";
  fee_bdt: number;
  free_ship_min: number;
  est_days: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  cta_label: string | null;
  position: number;
  active: boolean;
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Record<string, unknown> | null;
  created_at: string;
}

export interface StoreSettings {
  id: boolean;
  store_name: string;
  contact_email: string;
  contact_phone: string;
  free_ship_threshold: number;
  gift_wrap_fee: number;
  loyalty_earn_rate: number;
  tax_rate: number;
  payment_provider: string;
  logistics_provider: string;
  low_stock_threshold: number;
  updated_at: string;
}

/** Local cart shape persisted client-side for guests. */
export interface LocalCartLine {
  variantId: string;
  qty: number;
}
