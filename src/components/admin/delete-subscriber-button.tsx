"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteSubscriber } from "@/lib/actions/admin/marketing";

export function DeleteSubscriberButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Delete subscriber"
      className="text-muted hover:text-rose disabled:opacity-40"
      onClick={() => {
        if (!confirm("Remove this subscriber?")) return;
        start(async () => {
          const res = await deleteSubscriber(id);
          if (res.ok) {
            toast.success("Subscriber removed");
            router.refresh();
          } else toast.error("Could not delete.");
        });
      }}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
