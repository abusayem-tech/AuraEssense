import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { ProductImage } from "@/components/product/product-image";
import { WishlistButton } from "@/components/product/wishlist-button";
import { QuickAdd } from "@/components/product/quick-add";
import { formatBDT } from "@/lib/format";
import { defaultVariant, fromPrice, isOnSale, totalStock } from "@/lib/pricing";
import type { Product } from "@/types";

export function ProductCard({
  product,
  wished = false,
  priority = false,
}: {
  product: Product;
  wished?: boolean;
  priority?: boolean;
}) {
  const images = product.images ?? [];
  const primary = images[0]?.url;
  const secondary = images[1]?.url ?? primary;
  const price = fromPrice(product);
  const variant = defaultVariant(product);
  const onSale = variant ? isOnSale(variant) : false;
  const soldOut = totalStock(product) <= 0;

  return (
    <div className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-onyx-raised">
        <Link
          href={`/fragrances/${product.slug}`}
          aria-label={product.name}
          className="block h-full w-full"
        >
          <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0">
            <ProductImage
              src={primary}
              alt={product.name}
              initial={product.name}
              priority={priority}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            />
          </div>
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <ProductImage
              src={secondary}
              alt={`${product.name} alternate`}
              initial={product.name}
              sizes="(max-width:640px) 50vw, 25vw"
              className="scale-105"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
          {onSale && <Badge variant="gold">Sale</Badge>}
          {product.is_featured && !onSale && (
            <Badge variant="outline">Featured</Badge>
          )}
          {soldOut && <Badge variant="rose">Sold Out</Badge>}
        </div>

        <div className="absolute right-3 top-3">
          <WishlistButton productId={product.id} initial={wished} />
        </div>

        {/* Quick add */}
        {!soldOut && variant && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <QuickAdd product={product} />
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-muted">
          {product.brand?.name}
        </p>
        <h3 className="mt-1">
          <Link
            href={`/fragrances/${product.slug}`}
            className="font-display text-lg text-ivory transition-colors hover:text-gold"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-1.5 flex justify-center">
          <Rating
            value={product.rating_avg}
            count={product.rating_count}
            size={12}
          />
        </div>
        <p className="mt-2 text-sm text-ivory-dim tnum">
          {price > 0 ? (
            <>
              <span className="text-muted">from</span> {formatBDT(price)}
            </>
          ) : (
            "—"
          )}
        </p>
      </div>
    </div>
  );
}
