"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/admin/catalog";

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
