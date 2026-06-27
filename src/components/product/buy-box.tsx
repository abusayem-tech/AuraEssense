"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Bell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCart } from "@/lib/store/cart";
import { formatBDT } from "@/lib/format";
import { variantPrice, isOnSale, discountPercent } from "@/lib/pricing";
import { notifyBackInStock } from "@/lib/actions/stock";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

export function BuyBox({
  product,
  wished,
}: {
  product: Product;
  wished: boolean;
}) {
  const variants = useMemo(
    () => (product.variants ?? []).slice().sort((a, b) => Number(a.is_sample) - Number(b.is_sample) || a.size_ml - b.size_ml),
    [product.variants],
  );
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selected, setSelected] = useState<ProductVariant | undefined>(firstAvailable);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  if (!selected) return null;

  const price = variantPrice(selected);
  const onSale = isOnSale(selected);
  const soldOut = selected.stock <= 0;

  function handleAdd() {
    if (!selected || soldOut) return;
    add(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name ?? "",
        sizeMl: selected.size_ml,
        isSample: selected.is_sample,
        unitPrice: price,
        image: product.images?.[0]?.url ?? null,
        maxStock: selected.stock,
      },
      qty,
    );
    toast.success("Added to your bag", {
      description: `${product.name} · ${selected.is_sample ? "Sample" : selected.size_ml + "ml"} × ${qty}`,
    });
  }

  return (
    <div>
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl text-ivory tnum">{formatBDT(price)}</span>
        {onSale && (
          <>
            <span className="text-lg text-muted line-through tnum">{formatBDT(selected.price_bdt)}</span>
            <span className="bg-gold/15 px-2 py-0.5 text-xs text-gold">-{discountPercent(selected)}%</span>
          </>
        )}
      </div>

      {/* Variant selector */}
      <div className="mt-8">
        <p className="eyebrow !mb-3">Select Size</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {variants.map((v) => {
            const vSoldOut = v.stock <= 0;
            return (
              <button
                key={v.id}
                onClick={() => { setSelected(v); setQty(1); }}
                disabled={vSoldOut}
                className={cn(
                  "relative border px-4 py-3 text-left transition-colors",
                  selected.id === v.id ? "border-gold bg-gold/5" : "border-line-strong hover:border-ivory-dim",
                  vSoldOut && "opacity-40",
                )}
              >
                <span className="block text-sm text-ivory">
                  {v.is_sample ? "Sample" : `${v.size_ml}ml`}
                </span>
                <span className="mt-0.5 block text-xs text-muted tnum">
                  {formatBDT(variantPrice(v))}
                </span>
                {selected.id === v.id && (
                  <Check size={13} className="absolute right-2 top-2 text-gold" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock hint */}
      {!soldOut && selected.stock <= 5 && (
        <p className="mt-4 text-xs text-rose">Only {selected.stock} left in stock</p>
      )}

      {/* Qty + actions */}
      {soldOut ? (
        <BackInStock variantId={selected.id} />
      ) : (
        <div className="mt-8 flex items-stretch gap-3">
          <div className="flex items-center border border-line-strong">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-muted hover:text-ivory" aria-label="Decrease">
              <Minus size={15} />
            </button>
            <span className="w-10 text-center text-ivory tnum">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(selected.stock, q + 1))} disabled={qty >= selected.stock} className="px-3 text-muted hover:text-ivory disabled:opacity-30" aria-label="Increase">
              <Plus size={15} />
            </button>
          </div>
          <Button onClick={handleAdd} size="lg" className="flex-1">
            <ShoppingBag size={16} /> Add to Bag
          </Button>
          <div className="flex items-center justify-center border border-line-strong px-1">
            <WishlistButton productId={product.id} initial={wished} className="bg-transparent hover:bg-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}

function BackInStock({ variantId }: { variantId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await notifyBackInStock(variantId, email);
    setLoading(false);
    if (res.ok) setDone(true);
    else toast.error(res.message);
  }

  return (
    <div className="mt-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="w-full">
            <Bell size={16} /> Notify When Available
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle className="font-display text-2xl text-ivory">Back in Stock Alert</DialogTitle>
          {done ? (
            <div className="mt-6 text-center">
              <Check className="mx-auto mb-3 text-emerald" size={36} />
              <p className="text-sm text-ivory-dim">We&apos;ll email you the moment it returns.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <p className="text-sm text-muted">Enter your email and we&apos;ll let you know when this size is available again.</p>
              <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={15} />}
                Notify Me
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
