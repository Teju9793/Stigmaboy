import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserWithProfile } from "@/lib/supabase/server";
import { getUserPurchasedCourses } from "@/lib/queries/courses";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Courses — Dashboard",
  robots: { index: false },
};

export default async function DashboardCoursesPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const courses = await getUserPurchasedCourses(data.user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton fallback="/dashboard" label="Back to Dashboard" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-text-primary">
            My Courses
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {courses.length} {courses.length === 1 ? "course" : "courses"} enrolled
          </p>
        </div>
        <Button variant="primary" size="sm" asChild>
          <Link href="/courses">
            Browse More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              purchased
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center
                    border border-dashed border-bg-border rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20
                      flex items-center justify-center mb-5">
        <BookOpen className="w-7 h-7 text-brand-light" />
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        No courses yet
      </h2>
      <p className="text-text-muted text-sm max-w-xs mb-6">
        Browse our courses and start learning cinematic editing today.
      </p>
      <Button variant="primary" asChild>
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  );
}
