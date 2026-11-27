"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  toggleProduct: (productId: string) => boolean;
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  setProductIds: (ids: string[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggleProduct: (productId) => {
        const exists = get().productIds.includes(productId);
        if (exists) {
          set({ productIds: get().productIds.filter((id) => id !== productId) });
          return false;
        }
        set({ productIds: [...get().productIds, productId] });
        return true;
      },
      addProduct: (productId) => {
        if (!get().productIds.includes(productId)) {
          set({ productIds: [...get().productIds, productId] });
        }
      },
      removeProduct: (productId) => {
        set({ productIds: get().productIds.filter((id) => id !== productId) });
      },
      setProductIds: (ids) => set({ productIds: Array.from(new Set(ids)) }),
      clearWishlist: () => set({ productIds: [] }),
    }),
    {
      name: "drapesofcotton-wishlist-v1",
    }
  )
);
