import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { ProductGrid } from "@/components/product/product-grid";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Product } from "@/types";

export const metadata = { title: "Wishlist" };

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  family:fragrance_families(*),
  images:product_images(*),
  variants:product_variants(*)
`;

export default async function WishlistPage() {
  const user = await getUser();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user?.id ?? "");
  const ids = (links ?? []).map((l) => (l as { product_id: string }).product_id);

  let products: Product[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids);
    products = (data as unknown as Product[]) ?? [];
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-ivory">Your Wishlist</h2>
      {products.length === 0 ? (
        <EmptyState
          icon={<Heart size={36} />}
          title="Your wishlist is empty"
          description="Tap the heart on any fragrance to save it for later."
          action={
            <Button asChild>
              <Link href="/fragrances">Discover Fragrances</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={products} wishlist={new Set(ids)} columns={3} />
      )}
    </div>
  );
}
