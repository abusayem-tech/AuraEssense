"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, type CartLine } from "@/lib/store/cart";

export function AddToCartButton({
  line,
  qty = 1,
  label = "Add to Bag",
  ...buttonProps
}: {
  line: Omit<CartLine, "qty">;
  qty?: number;
  label?: string;
} & ButtonProps) {
  const add = useCart((s) => s.add);

  if (line.maxStock <= 0) {
    return (
      <Button disabled variant="outline" {...buttonProps}>
        Sold Out
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        add(line, qty);
        toast.success("Added to your bag", {
          description: `${line.name} · ${line.sizeMl}ml`,
        });
      }}
      {...buttonProps}
    >
      <ShoppingBag size={15} />
      {label}
    </Button>
  );
}
