"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/lib/store/cart";
import { formatBDT } from "@/lib/format";
import { DEFAULTS } from "@/lib/constants";

export function CartSheet({
  freeShipThreshold = DEFAULTS.freeShipThreshold,
}: {
  freeShipThreshold?: number;
}) {
  const { lines, isOpen, setOpen, setQty, remove, subtotal } = useCart();
  const sub = subtotal();
  const remaining = freeShipThreshold - sub;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent showClose={false}>
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <SheetTitle className="font-display text-2xl text-ivory flex items-center gap-3">
            <ShoppingBag size={20} className="text-gold" />
            Your Bag
          </SheetTitle>
          <SheetClose className="-m-2 p-2 text-muted hover:text-ivory transition-colors">
            <X size={20} />
          </SheetClose>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <ShoppingBag size={40} className="text-line-strong" />
            <div>
              <p className="font-display text-xl text-ivory">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted">
                Discover your next signature scent.
              </p>
            </div>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/fragrances">Explore Fragrances</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {remaining > 0 ? (
              <p className="border-b border-line bg-onyx px-6 py-3 text-center text-xs text-ivory-dim">
                Add{" "}
                <span className="text-gold tnum">{formatBDT(remaining)}</span>{" "}
                more for <span className="text-gold">complimentary shipping</span>
              </p>
            ) : (
              <p className="border-b border-line bg-onyx px-6 py-3 text-center text-xs text-emerald">
                You have unlocked complimentary shipping.
              </p>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-5">
                {lines.map((line) => (
                  <li key={line.variantId} className="flex gap-4">
                    <Link
                      href={`/fragrances/${line.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-onyx-raised"
                    >
                      <ProductImage
                        src={line.image}
                        alt={line.name}
                        initial={line.name}
                        sizes="80px"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="eyebrow !mb-0.5 !tracking-[0.2em] text-[0.6rem]">
                            {line.brand}
                          </p>
                          <Link
                            href={`/fragrances/${line.slug}`}
                            onClick={() => setOpen(false)}
                            className="text-sm text-ivory hover:text-gold transition-colors"
                          >
                            {line.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {`${line.sizeMl}ml`}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(line.variantId)}
                          className="h-fit text-muted hover:text-rose transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-line">
                          <button
                            onClick={() => setQty(line.variantId, line.qty - 1)}
                            className="px-2 py-1.5 text-muted hover:text-ivory"
                            aria-label="Decrease"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm text-ivory tnum">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.variantId, line.qty + 1)}
                            disabled={line.qty >= line.maxStock}
                            className="px-2 py-1.5 text-muted hover:text-ivory disabled:opacity-30"
                            aria-label="Increase"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm text-ivory tnum">
                          {formatBDT(line.unitPrice * line.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-6 py-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ivory-dim">Subtotal</span>
                <span className="font-display text-xl text-ivory tnum">
                  {formatBDT(sub)}
                </span>
              </div>
              <p className="text-xs text-muted">
                Shipping, taxes and discounts calculated at checkout.
              </p>
              <SheetClose asChild>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/fragrances">Continue Shopping</Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
