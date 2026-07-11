"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product/product-image";
import { startRouteProgress } from "@/components/layout/route-progress";
import { formatBDT } from "@/lib/format";

interface SearchResult {
  products: Array<{
    id: string;
    slug: string;
    name: string;
    brand?: { name: string } | null;
    images?: { url: string }[];
    variants?: { price_bdt: number; sale_price_bdt: number | null }[];
  }>;
  brands: Array<{ name: string; slug: string }>;
}

export function CommandSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    products: [],
    brands: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setQ("");
      setResults({ products: [], brands: [] });
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const query = q.trim();
    const t = setTimeout(
      async () => {
        if (query.length < 2) {
          setResults({ products: [], brands: [] });
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          setResults(await res.json());
        } catch {
          /* ignore */
        } finally {
          setLoading(false);
        }
      },
      query.length < 2 ? 0 : 250,
    );
    return () => clearTimeout(t);
  }, [q]);

  function go(href: string) {
    onOpenChange(false);
    startRouteProgress();
    router.push(href);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) go(`/fragrances?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="max-w-xl p-0 top-[15%] translate-y-0 max-h-[80dvh]">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <form
          onSubmit={submit}
          className="flex items-center gap-3 border-b border-line px-5 py-4"
        >
          <Search size={18} className="text-gold" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fragrances, brands, notes…"
            className="flex-1 bg-transparent text-base text-ivory placeholder:text-muted focus:outline-none"
          />
          {loading && <Loader2 size={16} className="animate-spin text-muted" />}
        </form>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {q.trim().length >= 2 &&
            !loading &&
            results.products.length === 0 &&
            results.brands.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No results for “{q}”.
              </p>
            )}

          {results.brands.length > 0 && (
            <div className="px-2 py-2">
              <p className="eyebrow px-2 !mb-2">Brands</p>
              {results.brands.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => go(`/brands/${b.slug}`)}
                  className="flex w-full items-center justify-between px-2 py-2 text-sm text-ivory-dim hover:bg-onyx-raised hover:text-ivory"
                >
                  {b.name}
                  <ArrowRight size={14} className="text-muted" />
                </button>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="px-2 py-2">
              <p className="eyebrow px-2 !mb-2">Fragrances</p>
              {results.products.map((p) => {
                const price = p.variants?.length
                  ? Math.min(
                      ...p.variants.map((v) => v.sale_price_bdt ?? v.price_bdt),
                    )
                  : 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => go(`/fragrances/${p.slug}`)}
                    className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-onyx-raised"
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-onyx-raised">
                      <ProductImage
                        src={p.images?.[0]?.url}
                        alt={p.name}
                        initial={p.name}
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                        {p.brand?.name}
                      </p>
                      <p className="text-sm text-ivory">{p.name}</p>
                    </div>
                    <span className="text-xs text-gold tnum">
                      {formatBDT(price)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {q.trim().length < 2 && (
            <p className="px-4 py-8 text-center text-xs text-muted">
              Type to search the collection · Press{" "}
              <kbd className="border border-line px-1.5 py-0.5">Esc</kbd> to close
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
