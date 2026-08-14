"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { moderateReview, deleteReview, setReviewHidden } from "@/lib/actions/admin/marketing";

export function ReviewModeration({
  id,
  status,
  isHidden,
}: {
  id: string;
  status: string;
  isHidden: boolean;
}) {
  const router = useRouter();
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
        onClick={() =>
          start(async () => {
            await setReviewHidden(id, !isHidden);
            toast.success(isHidden ? "Unhidden" : "Hidden from storefront");
            router.refresh();
          })
        }
        disabled={pending}
        className="flex items-center gap-1 border border-line-strong px-2 py-1 text-xs text-ivory-dim hover:text-gold"
      >
        {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
        {isHidden ? "Unhide" : "Hide"}
      </button>
      <button
        onClick={() => {
          if (!confirm("Delete this review permanently?")) return;
          start(async () => { await deleteReview(id); toast.success("Deleted"); });
        }}
        disabled={pending}
        className="text-muted hover:text-rose"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}
