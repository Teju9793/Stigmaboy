"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import type { CartItem } from "@/types/database.types";

interface AddToCartButtonProps {
  item: CartItem;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AddToCartButton({
  item,
  fullWidth = false,
  size = "lg",
}: AddToCartButtonProps) {
  const { addItem, hasItem } = useCartStore();
  const inCart = hasItem(item.id);

  if (inCart) {
    return (
      <Button
        variant="secondary"
        size={size}
        fullWidth={fullWidth}
        leftIcon={<Check className="w-4 h-4 text-success" />}
        className="border-success/30 text-success hover:bg-success/5"
        disabled
      >
        Added to Cart
      </Button>
    );
  }

  return (
    <Button
      variant="cta"
      size={size}
      fullWidth={fullWidth}
      leftIcon={<ShoppingCart className="w-4 h-4" />}
      onClick={() => addItem(item)}
    >
      Add to Cart
    </Button>
  );
}
