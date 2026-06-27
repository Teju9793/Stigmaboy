"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface BackButtonProps {
  /** Fallback URL if there is no browser history to go back to */
  fallback?: string;
  /** Optional label override */
  label?: string;
  className?: string;
}

/**
 * Universal back button.
 * Uses browser history when available; falls back to the `fallback` href.
 * This is a permanent project rule — every internal page must use this.
 */
export function BackButton({
  fallback = "/dashboard",
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // If there is no referrer history (opened in new tab / direct navigation),
    // canGoBack is false so we push to the fallback route instead.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary",
        "hover:text-text-primary transition-colors duration-150 group",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft
        className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150"
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
