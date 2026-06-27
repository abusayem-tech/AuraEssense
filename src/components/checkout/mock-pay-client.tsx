"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Ban } from "lucide-react";
import { simulatePayment } from "@/lib/actions/checkout";
import { useCart } from "@/lib/store/cart";

export function MockPayClient({
  orderId,
  transactionId,
}: {
  orderId: string;
  transactionId: string;
}) {
  const router = useRouter();
  const clear = useCart((s) => s.clear);
  const [loading, setLoading] = useState<string | null>(null);

  async function pay(outcome: "success" | "fail" | "cancel") {
    setLoading(outcome);
    const res = await simulatePayment(orderId, transactionId, outcome);
    if (outcome === "success") clear();
    router.push(res.redirect);
  }

  return (
    <div className="grid gap-3">
      <button
        onClick={() => pay("success")}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 bg-emerald py-3 text-sm font-medium uppercase tracking-widest text-onyx transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading === "success" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        Pay Successfully
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => pay("fail")}
          disabled={!!loading}
          className="flex items-center justify-center gap-2 border border-rose/40 py-3 text-xs uppercase tracking-widest text-rose hover:bg-rose/10 disabled:opacity-50"
        >
          {loading === "fail" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          Fail
        </button>
        <button
          onClick={() => pay("cancel")}
          disabled={!!loading}
          className="flex items-center justify-center gap-2 border border-line-strong py-3 text-xs uppercase tracking-widest text-muted hover:text-ivory disabled:opacity-50"
        >
          {loading === "cancel" ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
          Cancel
        </button>
      </div>
    </div>
  );
}
