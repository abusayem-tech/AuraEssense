import { createClient } from "@/lib/supabase/server";
import { variantPrice } from "@/lib/pricing";
import type { Product } from "@/types";

const PAID_STATUSES = ["paid", "processing", "dispatched", "in_transit", "delivered"];

interface OrderRow {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  user_id: string | null;
  zone: string;
  created_at: string;
  paid_at: string | null;
  items: Array<{
    product_id: string | null;
    product_name: string;
    brand_name: string | null;
    unit_price: number;
    qty: number;
  }>;
}

export interface Analytics {
  revenue: number;
  revenuePrev: number;
  revenueTrend: number;
  orders: number;
  ordersPrev: number;
  ordersTrend: number;
  aov: number;
  units: number;
  paidCount: number;
  failedCount: number;
  newCustomers: number;
  returningRate: number;
  series: { label: string; revenue: number; orders: number }[];
  byBrand: { label: string; value: number }[];
  byProduct: { label: string; value: number; units: number }[];
  byStatus: { status: string; count: number }[];
  byZone: { zone: string; revenue: number }[];
  topCustomers: { name: string; orders: number; spend: number }[];
  lowStock: { name: string; size: number; stock: number }[];
  inventoryValue: number;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getAnalytics(rangeDays = 30): Promise<Analytics> {
  const supabase = await createClient();

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - rangeDays);
  const prevStart = new Date(start);
  prevStart.setDate(start.getDate() - rangeDays);

  const [{ data: ordersData }, { data: productsData }, { data: profilesData }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, items:order_items(product_id, product_name, brand_name, unit_price, qty)")
        .gte("created_at", prevStart.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("products")
        .select("id, name, variants:product_variants(size_ml, price_bdt, sale_price_bdt, stock, is_sample)")
        .eq("is_active", true),
      supabase
        .from("profiles")
        .select("id, full_name, created_at"),
    ]);

  const orders = (ordersData as unknown as OrderRow[]) ?? [];
  const products = (productsData as unknown as Product[]) ?? [];
  const profiles = (profilesData as unknown as { id: string; full_name: string | null; created_at: string }[]) ?? [];

  const inRange = orders.filter((o) => new Date(o.created_at) >= start);
  const prevRange = orders.filter(
    (o) => new Date(o.created_at) >= prevStart && new Date(o.created_at) < start,
  );

  const paid = inRange.filter((o) => PAID_STATUSES.includes(o.status));
  const paidPrev = prevRange.filter((o) => PAID_STATUSES.includes(o.status));

  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const revenuePrev = paidPrev.reduce((s, o) => s + o.total, 0);
  const ordersCount = paid.length;
  const ordersPrevCount = paidPrev.length;
  const units = paid.reduce(
    (s, o) => s + o.items.reduce((u, it) => u + it.qty, 0),
    0,
  );

  // Daily series.
  const seriesMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    seriesMap.set(dayKey(d), { revenue: 0, orders: 0 });
  }
  for (const o of paid) {
    const k = dayKey(new Date(o.created_at));
    const cur = seriesMap.get(k);
    if (cur) {
      cur.revenue += o.total;
      cur.orders += 1;
    }
  }
  const series = Array.from(seriesMap.entries()).map(([k, v]) => ({
    label: new Date(k).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    revenue: v.revenue,
    orders: v.orders,
  }));

  // By brand & product.
  const brandMap = new Map<string, number>();
  const productMap = new Map<string, { value: number; units: number }>();
  for (const o of paid) {
    for (const it of o.items) {
      const rev = it.unit_price * it.qty;
      if (it.brand_name) brandMap.set(it.brand_name, (brandMap.get(it.brand_name) ?? 0) + rev);
      const p = productMap.get(it.product_name) ?? { value: 0, units: 0 };
      p.value += rev;
      p.units += it.qty;
      productMap.set(it.product_name, p);
    }
  }
  const byBrand = Array.from(brandMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const byProduct = Array.from(productMap.entries())
    .map(([label, v]) => ({ label, value: v.value, units: v.units }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // By status (all in range).
  const statusMap = new Map<string, number>();
  for (const o of inRange) statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

  const failedCount = inRange.filter((o) => o.status === "failed").length;

  // By zone.
  const zoneMap = new Map<string, number>();
  for (const o of paid) zoneMap.set(o.zone, (zoneMap.get(o.zone) ?? 0) + o.total);
  const byZone = Array.from(zoneMap.entries()).map(([zone, revenue]) => ({ zone, revenue }));

  // Customers.
  const nameById = new Map(profiles.map((p) => [p.id, p.full_name ?? "Guest"]));
  const custMap = new Map<string, { orders: number; spend: number }>();
  for (const o of paid) {
    if (!o.user_id) continue;
    const c = custMap.get(o.user_id) ?? { orders: 0, spend: 0 };
    c.orders += 1;
    c.spend += o.total;
    custMap.set(o.user_id, c);
  }
  const topCustomers = Array.from(custMap.entries())
    .map(([id, v]) => ({ name: nameById.get(id) ?? "Customer", ...v }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 6);
  const returningCustomers = Array.from(custMap.values()).filter((c) => c.orders > 1).length;
  const returningRate = custMap.size ? (returningCustomers / custMap.size) * 100 : 0;
  const newCustomers = profiles.filter((p) => new Date(p.created_at) >= start).length;

  // Inventory.
  const lowStock: { name: string; size: number; stock: number }[] = [];
  let inventoryValue = 0;
  for (const p of products) {
    for (const v of p.variants ?? []) {
      inventoryValue += variantPrice(v) * v.stock;
      if (v.stock <= 5 && !v.is_sample)
        lowStock.push({ name: p.name, size: v.size_ml, stock: v.stock });
    }
  }
  lowStock.sort((a, b) => a.stock - b.stock);

  const trend = (cur: number, prev: number) =>
    prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100;

  return {
    revenue,
    revenuePrev,
    revenueTrend: trend(revenue, revenuePrev),
    orders: ordersCount,
    ordersPrev: ordersPrevCount,
    ordersTrend: trend(ordersCount, ordersPrevCount),
    aov: ordersCount ? Math.round(revenue / ordersCount) : 0,
    units,
    paidCount: ordersCount,
    failedCount,
    newCustomers,
    returningRate,
    series,
    byBrand,
    byProduct,
    byStatus,
    byZone,
    topCustomers,
    lowStock: lowStock.slice(0, 8),
    inventoryValue,
  };
}
