"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils/format";
import type { TemplateCategory } from "@/types/database.types";

const SOFTWARE_OPTIONS = [
  "All Software",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Final Cut Pro",
  "Lightroom",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

interface TemplateFiltersProps {
  categories: TemplateCategory[];
  totalCount: number;
}

export function TemplateFilters({ categories, totalCount }: TemplateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") ?? "all";
  const currentSoftware = searchParams.get("software") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const currentSearch = searchParams.get("search") ?? "";
  const currentFree = searchParams.get("free") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [router, pathname]);

  const hasActiveFilters =
    currentCategory !== "all" ||
    currentSort !== "newest" ||
    currentSearch !== "" ||
    currentSoftware !== "" ||
    currentFree !== "";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search templates..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const val = e.target.value;
            clearTimeout(
              (window as Window & { _tplSearchTimer?: ReturnType<typeof setTimeout> })._tplSearchTimer
            );
            (window as Window & { _tplSearchTimer?: ReturnType<typeof setTimeout> })._tplSearchTimer =
              setTimeout(() => updateParam("search", val), 400);
          }}
          className="input-base pl-11 pr-4"
          aria-label="Search templates"
        />
        {currentSearch && (
          <button
            onClick={() => updateParam("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                       text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category + Free toggle row */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          onClick={() => updateParam("category", "all")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
            currentCategory === "all"
              ? "bg-brand text-white shadow-brand-glow"
              : "bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary hover:border-brand/30"
          )}
        >
          All
        </button>

        {/* Free toggle */}
        <button
          onClick={() => updateParam("free", currentFree === "true" ? "" : "true")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5",
            currentFree === "true"
              ? "bg-success text-white"
              : "bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary hover:border-success/30"
          )}
        >
          <Tag className="w-3 h-3" />
          Free
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam("category", cat.slug)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
              currentCategory === cat.slug
                ? "bg-brand text-white shadow-brand-glow"
                : "bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary hover:border-brand/30"
            )}
            aria-pressed={currentCategory === cat.slug}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Software + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Software filter */}
        <select
          value={currentSoftware}
          onChange={(e) =>
            updateParam("software", e.target.value === "All Software" ? "" : e.target.value)
          }
          className="bg-bg-elevated border border-bg-border text-text-secondary text-xs
                     rounded-xl px-3 py-2 focus:outline-none focus:border-brand/50
                     cursor-pointer transition-colors hover:border-brand/30"
          aria-label="Filter by software"
        >
          {SOFTWARE_OPTIONS.map((sw) => (
            <option key={sw} value={sw === "All Software" ? "" : sw}>
              {sw}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0" />
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-bg-elevated border border-bg-border text-text-secondary text-xs
                       rounded-xl px-3 py-2 focus:outline-none focus:border-brand/50
                       cursor-pointer transition-colors hover:border-brand/30"
            aria-label="Sort templates"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {isPending ? (
            <span className="animate-pulse">Filtering…</span>
          ) : (
            <>
              <span className="text-text-primary font-semibold">{totalCount}</span>{" "}
              {totalCount === 1 ? "template" : "templates"} found
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-light hover:text-brand transition-colors
                       flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
