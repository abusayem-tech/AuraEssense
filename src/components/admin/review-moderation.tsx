"use client";

import { useTransition } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { moderateReview, deleteReview } from "@/lib/actions/admin/marketing";

export function ReviewModeration({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {status !== "approved" && (
        <button
          onClick={() => start(async () => { await moderateReview(id, "approved"); toast.success("Approved"); })}
          disabled={pending}
          className="flex items-center gap-1 border border-emerald/40 px-2 py-1 text-xs text-emerald hover:bg-emerald/10"
        >
          <Check size={12} /> Approve
        </button>
      )}
      {status !== "rejected" && (
        <button
          onClick={() => start(async () => { await moderateReview(id, "rejected"); toast.success("Rejected"); })}
          disabled={pending}
          className="flex items-center gap-1 border border-line-strong px-2 py-1 text-xs text-ivory-dim hover:text-rose"
        >
          <X size={12} /> Reject
        </button>
      )}
      <button
        onClick={() => start(async () => { await deleteReview(id); toast.success("Deleted"); })}
        disabled={pending}
        className="text-muted hover:text-rose"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}
