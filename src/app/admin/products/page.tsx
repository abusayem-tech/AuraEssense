import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Table, Th, Td, EmptyRow, LinkButton } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product/product-image";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/format";
import { fromPrice, totalStock } from "@/lib/pricing";
import type { Product } from "@/types";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, brand:brands(name), images:product_images(url, position), variants:product_variants(*)")
    .order("created_at", { ascending: false });
  const products = (data as unknown as Product[]) ?? [];

  return (
    <div>
      <AdminHeader
        title="Products"
        description={`${products.length} fragrances in the catalog.`}
        action={
          <LinkButton href="/admin/products/new">
            <Plus size={14} /> New Product
          </LinkButton>
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Brand</Th>
            <Th>Price from</Th>
            <Th>Stock</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <EmptyRow colSpan={5} label="No products yet." />
          ) : (
            products.map((p) => {
              const stock = totalStock(p);
              return (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-gold">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-onyx-raised">
                        <ProductImage src={p.images?.[0]?.url} alt={p.name} initial={p.name} sizes="40px" />
                      </span>
                      <span className="text-ivory">{p.name}</span>
                    </Link>
                  </Td>
                  <Td>{p.brand?.name}</Td>
                  <Td className="tnum">{formatBDT(fromPrice(p))}</Td>
                  <Td className={stock <= 5 ? "text-rose" : ""}>{stock}</Td>
                  <Td>
                    {p.is_active ? (
                      <Badge variant="emerald">Active</Badge>
                    ) : (
                      <Badge variant="muted">Hidden</Badge>
                    )}
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}
