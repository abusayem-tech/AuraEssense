"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

export function CartClearer() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
