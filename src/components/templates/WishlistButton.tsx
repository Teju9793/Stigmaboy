"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/format";

interface WishlistButtonProps {
  itemId: string;
  itemType: "course" | "template";
  initialState: boolean;
  userId: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({
  itemId,
  itemType,
  initialState,
  userId,
  size = "md",
  className,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialState);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const toggle = () => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    const next = !wishlisted;
    setWishlisted(next); // optimistic

    startTransition(async () => {
      if (next) {
        await supabase.from("wishlist_items").insert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
        });
      } else {
        await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", userId)
          .eq("item_type", itemType)
          .eq("item_id", itemId);
      }
    });
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        btnSize,
        "rounded-xl flex items-center justify-center transition-all duration-200",
        "border",
        wishlisted
          ? "bg-error/15 border-error/30 text-error hover:bg-error/25"
          : "bg-bg-elevated border-bg-border text-text-muted hover:text-error hover:border-error/30 hover:bg-error/10",
        isPending && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <Heart
        className={cn(iconSize, wishlisted && "fill-current")}
      />
    </button>
  );
}
