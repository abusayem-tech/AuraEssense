"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  sizeMl: number;
  isSample: boolean;
  unitPrice: number;
  image: string | null;
  qty: number;
  maxStock: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.variantId === line.variantId,
          );
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, qty: Math.min(l.maxStock, l.qty + qty) }
                  : l,
              ),
            };
          }
          return {
            isOpen: true,
            lines: [...state.lines, { ...line, qty: Math.min(line.maxStock, qty) }],
          };
        }),
      remove: (variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.variantId !== variantId),
        })),
      setQty: (variantId, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.variantId === variantId
                ? { ...l, qty: Math.max(0, Math.min(l.maxStock, qty)) }
                : l,
            )
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),
      count: () => get().lines.reduce((n, l) => n + l.qty, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.unitPrice * l.qty, 0),
    }),
    { name: "aura-cart" },
  ),
);
