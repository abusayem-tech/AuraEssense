import { AdminHeader, Table, Th, Td, EmptyRow, StatCard } from "@/components/admin/admin-ui";
import { StockAdjuster } from "@/components/admin/stock-adjuster";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { formatBDT } from "@/lib/format";

interface Row {
  id: string;
  size_ml: number;
  sku: string;
  price_bdt: number;
  sale_price_bdt: number | null;
  stock: number;
  is_sample: boolean;
  product: { name: string; brand: { name: string } | null } | null;
}

export default async function InventoryPage() {
  const supabase = await createClient();
  const [{ data }, settings] = await Promise.all([
    supabase
      .from("product_variants")
      .select("*, product:products(name, brand:brands(name))")
      .order("stock", { ascending: true }),
    getSettings(),
  ]);
  const rows = (data as unknown as Row[]) ?? [];
  const lowThreshold = settings.lowStockThreshold;

  const totalUnits = rows.reduce((s, r) => s + r.stock, 0);
  const lowCount = rows.filter((r) => r.stock <= lowThreshold && !r.is_sample).length;
  const value = rows.reduce((s, r) => s + (r.sale_price_bdt ?? r.price_bdt) * r.stock, 0);

  return (
    <div>
      <AdminHeader title="Inventory" description="Stock levels across all variants." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Units" value={String(totalUnits)} />
        <StatCard label="Low Stock Variants" value={String(lowCount)} />
        <StatCard label="Inventory Value" value={formatBDT(value)} />
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Brand</Th>
            <Th>Size</Th>
            <Th>SKU</Th>
            <Th>Price</Th>
            <Th>Stock</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} label="No inventory yet." />
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <Td className="text-ivory">{r.product?.name}</Td>
                <Td>{r.product?.brand?.name}</Td>
                <Td>{r.is_sample ? "Sample" : `${r.size_ml}ml`}</Td>
                <Td className="text-xs">{r.sku}</Td>
                <Td className="tnum">{formatBDT(r.sale_price_bdt ?? r.price_bdt)}</Td>
                <Td><StockAdjuster variantId={r.id} stock={r.stock} /></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
