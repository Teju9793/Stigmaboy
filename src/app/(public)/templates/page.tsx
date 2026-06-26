import type { Metadata } from "next";
import { Suspense } from "react";
import { getTemplates, getTemplateCategories } from "@/lib/queries/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateFilters } from "@/components/templates/TemplateFilters";
import { PaginationBar } from "@/components/courses/PaginationBar";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Premium Premiere Pro, After Effects, and DaVinci Resolve templates. Download and edit instantly.",
  openGraph: {
    title: "Editing Templates — STIGMABOY",
    description:
      "Plug-and-play motion templates, LUTs, and presets for video creators.",
  },
};

export const revalidate = 600;

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: {
    category?: string;
    software?: string;
    sort?: string;
    search?: string;
    free?: string;
    page?: string;
  };
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const [{ templates, total }, categories] = await Promise.all([
    getTemplates({
      category: searchParams.category,
      software: searchParams.software,
      sort: searchParams.sort as never,
      search: searchParams.search,
      isFree: searchParams.free === "true" ? true : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    getTemplateCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="section-padding">
      <div className="section-container">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-light mb-3">
            Plug &amp; Play
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary mb-4">
            Editing Templates
          </h1>
          <p className="text-text-secondary max-w-xl">
            Professional Premiere Pro, After Effects &amp; DaVinci Resolve templates.
            Download, customize, and publish in minutes.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="h-32 bg-bg-elevated rounded-2xl animate-pulse" />
            }
          >
            <TemplateFilters categories={categories} totalCount={total} />
          </Suspense>
        </div>

        {/* Grid */}
        {templates.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12">
                <PaginationBar
                  currentPage={page}
                  totalPages={totalPages}
                  searchParams={searchParams}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-5">
        <span className="text-3xl">📦</span>
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        No templates found
      </h2>
      <p className="text-text-muted text-sm max-w-xs">
        Try different filters or check back soon — new templates drop weekly.
      </p>
    </div>
  );
}
