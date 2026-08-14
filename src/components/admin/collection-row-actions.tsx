"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCollection } from "@/lib/actions/admin/catalog";

export function CollectionRowActions({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex justify-end gap-3">
      <Link
        href={`/admin/collections/${collectionId}`}
        className="text-muted hover:text-gold"
        aria-label="Edit"
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-label="Delete"
        className="text-muted hover:text-rose disabled:opacity-40"
        onClick={() => {
          if (!confirm("Delete this collection?")) return;
          start(async () => {
            const res = await deleteCollection(collectionId);
            if (res.ok) {
              toast.success("Collection deleted");
              router.refresh();
            } else toast.error("Could not delete.");
          });
        }}
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
