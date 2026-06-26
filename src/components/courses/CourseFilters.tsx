"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/format";

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export function CourseFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentDifficulty = searchParams.get("difficulty") ?? "all";
  const currentSort = searchParams.get("sort") ?? "newest";
  const currentSearch = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  const hasActiveFilters =
    currentDifficulty !== "all" || currentSort !== "newest" || currentSearch !== "";

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search courses..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce via setTimeout
            clearTimeout((window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer);
            (window as Window & { _searchTimer?: ReturnType<typeof setTimeout> })._searchTimer = setTimeout(() => updateParam("search", val), 400);
          }}
          className="input-base pl-11 pr-4"
          aria-label="Search courses"
        />
        {currentSearch && (
          <button
            onClick={() => updateParam("search", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg
                       text-text-muted hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Difficulty tabs */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by difficulty">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("difficulty", opt.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150",
                currentDifficulty === opt.value
                  ? "bg-brand text-white shadow-brand-glow"
                  : "bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary hover:border-brand/30"
              )}
              aria-pressed={currentDifficulty === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-text-muted shrink-0" />
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="bg-bg-elevated border border-bg-border text-text-secondary text-xs
                       rounded-xl px-3 py-2 focus:outline-none focus:border-brand/50
                       cursor-pointer transition-colors hover:border-brand/30"
            aria-label="Sort courses"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results + clear */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          {isPending ? (
            <span className="animate-pulse">Filtering…</span>
          ) : (
            <>
              <span className="text-text-primary font-semibold">{totalCount}</span>{" "}
              {totalCount === 1 ? "course" : "courses"} found
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
