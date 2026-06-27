"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";
import { defaultVariant, variantPrice } from "@/lib/pricing";
import type { Product } from "@/types";

export function QuickAdd({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const variant = defaultVariant(product);
  if (!variant) return null;

  return (
    <button
      onClick={() => {
        add(
          {
            variantId: variant.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand?.name ?? "",
            sizeMl: variant.size_ml,
            isSample: variant.is_sample,
            unitPrice: variantPrice(variant),
            image: product.images?.[0]?.url ?? null,
            maxStock: variant.stock,
          },
          1,
        );
        toast.success("Added to your bag", {
          description: `${product.name} · ${variant.size_ml}ml`,
        });
      }}
      className="flex w-full items-center justify-center gap-2 bg-ivory/95 py-3 text-xs uppercase tracking-widest text-onyx backdrop-blur-sm transition-colors hover:bg-gold"
    >
      <ShoppingBag size={14} />
      Quick Add · {variant.size_ml}ml
    </button>
  );
}
