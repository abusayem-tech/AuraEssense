"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initial = false,
  className,
  size = 18,
}: {
  productId: string;
  initial?: boolean;
  className?: string;
  size?: number;
}) {
  const [wished, setWished] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    const next = !wished;
    setWished(next);
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (res.needsAuth) {
        setWished(false);
        toast.error("Please sign in to save favourites.");
        router.push("/login?redirect=/fragrances");
        return;
      }
      if (!res.ok) {
        setWished(!next);
        toast.error("Could not update wishlist.");
        return;
      }
      setWished(res.wished);
      toast.success(res.wished ? "Saved to wishlist" : "Removed from wishlist");
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      className={cn(
        "flex h-9 w-9 items-center justify-center bg-onyx/70 backdrop-blur-sm transition-colors hover:bg-onyx",
        className,
      )}
    >
      <Heart
        size={size}
        className={cn(
          "transition-all",
          wished ? "fill-rose text-rose" : "text-ivory-dim hover:text-rose",
        )}
        strokeWidth={1.5}
      />
    </button>
  );
}
