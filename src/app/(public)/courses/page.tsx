import type { Metadata } from "next";
import { Suspense } from "react";
import { getCourses } from "@/lib/queries/courses";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { PaginationBar } from "@/components/courses/PaginationBar";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Learn cinematic video editing, color grading, and motion graphics. Premium courses from STIGMABOY.",
  openGraph: {
    title: "Editing Courses — STIGMABOY",
    description: "Premium video editing courses taught by STIGMABOY.",
  },
};

// Revalidate every 10 minutes
export const revalidate = 600;

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: {
    difficulty?: string;
    sort?: string;
    search?: string;
    page?: string;
  };
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const { courses, total } = await getCourses({
    difficulty: searchParams.difficulty,
    sort: searchParams.sort as never,
    search: searchParams.search,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="section-padding">
      <div className="section-container">

        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-light mb-3">
            Learn from the best
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary mb-4">
            Editing Courses
          </h1>
          <p className="text-text-secondary max-w-xl">
            Structured courses covering color grading, motion graphics, cinematic
            cuts, and pro-level Premiere Pro & After Effects techniques.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-24 bg-bg-elevated rounded-2xl animate-pulse" />}>
            <CourseFilters totalCount={total} />
          </Suspense>
        </div>

        {/* Grid */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
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
        <span className="text-3xl">🎬</span>
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        No courses found
      </h2>
      <p className="text-text-muted text-sm max-w-xs">
        Try adjusting your filters or check back soon — new courses drop regularly.
      </p>
    </div>
  );
}

