"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => { added: boolean; reason?: string };
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
}

function isSameLine(a: CartItem, productId: string, variantId: string | null): boolean {
  return a.productId === productId && (a.variantId ?? null) === (variantId ?? null);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),
      addItem: (incoming) => {
        if (incoming.maxStock <= 0) {
          return { added: false, reason: "This saree is currently out of stock." };
        }

        const existing = get().items.find((i) =>
          isSameLine(i, incoming.productId, incoming.variantId)
        );

        if (existing) {
          const nextQty = existing.quantity + incoming.quantity;
          if (nextQty > Math.min(existing.maxStock, 20)) {
            return {
              added: false,
              reason: `Only ${existing.maxStock} available in stock.`,
            };
          }

          set({
            items: get().items.map((i) =>
              isSameLine(i, incoming.productId, incoming.variantId)
                ? { ...i, quantity: nextQty, unitPrice: incoming.unitPrice }
                : i
            ),
          });
          return { added: true };
        }

        const clampedQty = Math.min(Math.max(1, incoming.quantity), incoming.maxStock, 20);
        set({ items: [...get().items, { ...incoming, quantity: clampedQty }] });
        return { added: true };
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((item) => {
            if (!isSameLine(item, productId, variantId)) return item;
            const clamped = Math.min(Math.max(1, quantity), item.maxStock, 20);
            return { ...item, quantity: clamped };
          }),
        });
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter((i) => !isSameLine(i, productId, variantId)),
        });
      },
      clearCart: () => set({ items: [] }),
      replaceItems: (items) => set({ items }),
    }),
    {
      name: "drapesofcotton-bag-v1",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function selectCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
