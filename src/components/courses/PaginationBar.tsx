"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function PaginationBar({ currentPage, totalPages, searchParams }: PaginationBarProps) {
  const pathname = usePathname();

  function buildHref(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // Generate page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {/* Prev */}
      <PagLink
        href={buildHref(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </PagLink>

      {/* Pages */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-text-muted text-sm"
          >
            …
          </span>
        ) : (
          <PagLink
            key={p}
            href={buildHref(p)}
            active={p === currentPage}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </PagLink>
        )
      )}

      {/* Next */}
      <PagLink
        href={buildHref(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </PagLink>
    </nav>
  );
}

function PagLink({
  href,
  children,
  active = false,
  disabled = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}) {
  if (disabled) {
    return (
      <span
        className="w-9 h-9 flex items-center justify-center rounded-xl
                   text-text-muted cursor-not-allowed opacity-40 text-sm"
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium",
        "transition-all duration-150",
        active
          ? "bg-brand text-white shadow-brand-glow"
          : "bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary hover:border-brand/30"
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
