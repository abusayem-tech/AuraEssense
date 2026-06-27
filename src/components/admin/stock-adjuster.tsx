"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adjustStock } from "@/lib/actions/admin/catalog";

export function StockAdjuster({
  variantId,
  stock,
}: {
  variantId: string;
  stock: number;
}) {
  const [value, setValue] = useState(stock);
  const [pending, start] = useTransition();

  function change(delta: number) {
    start(async () => {
      await adjustStock(variantId, delta, "Manual adjustment");
      setValue((v) => Math.max(0, v + delta));
      toast.success("Stock updated");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => change(-1)} disabled={pending || value <= 0} className="border border-line-strong p-1.5 text-muted hover:text-ivory disabled:opacity-30">
        <Minus size={13} />
      </button>
      <span className={`w-10 text-center text-sm tnum ${value <= 5 ? "text-rose" : "text-ivory"}`}>
        {pending ? <Loader2 size={13} className="mx-auto animate-spin" /> : value}
      </span>
      <button onClick={() => change(1)} disabled={pending} className="border border-line-strong p-1.5 text-muted hover:text-ivory">
        <Plus size={13} />
      </button>
    </div>
  );
}
