"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/admin/catalog";

export function ProductRowActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex justify-end gap-3">
      <Link
        href={`/admin/products/${productId}`}
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
          if (!confirm("Delete this product permanently?")) return;
          start(async () => {
            const res = await deleteProduct(productId);
            if (res.ok) {
              toast.success("Product deleted");
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

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("Delete this product permanently?")) return;
          await deleteProduct(productId);
          toast.success("Product deleted");
          router.push("/admin/products");
        })
      }
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Delete Product
    </Button>
  );
}
