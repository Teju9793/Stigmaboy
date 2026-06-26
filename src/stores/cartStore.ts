"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/database.types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
  hasItem: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) return; // No duplicates

        set((state) => ({
          items: [...state.items, item],
          isOpen: true,
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.length,

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price, 0),

      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "stigmaboy-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist items — not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
