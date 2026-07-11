"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { range } from "@/lib/utils";

export function Pagination({ pageCount }: { pageCount: number }) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false, clearOnDefault: true }),
  );
  if (pageCount <= 1) return null;

  function goto(p: number) {
    setPage(p === 1 ? null : p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => goto(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="flex h-10 w-10 items-center justify-center border border-line text-ivory-dim hover:border-gold hover:text-gold disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {range(pageCount).map((i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => goto(p)}
            className={cn(
              "flex h-10 w-10 items-center justify-center border text-sm tnum transition-colors",
              p === page
                ? "border-gold bg-gold text-on-gold"
                : "border-line text-ivory-dim hover:border-gold hover:text-gold",
            )}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => goto(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="flex h-10 w-10 items-center justify-center border border-line text-ivory-dim hover:border-gold hover:text-gold disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
