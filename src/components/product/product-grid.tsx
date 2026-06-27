import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  wishlist,
  columns = 4,
}: {
  products: Product[];
  wishlist?: Set<string>;
  columns?: 3 | 4;
}) {
  const cols =
    columns === 3
      ? "grid-cols-2 lg:grid-cols-3"
      : "grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid gap-x-5 gap-y-10 sm:gap-x-6 ${cols}`}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          wished={wishlist?.has(p.id)}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
