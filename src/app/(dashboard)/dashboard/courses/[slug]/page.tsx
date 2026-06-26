import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getUserWithProfile } from "@/lib/supabase/server";
import {
  getCourseBySlug,
  getUserCoursePurchase,
  getCourseProgress,
} from "@/lib/queries/courses";
import { CoursePlayerClient } from "./CoursePlayerClient";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: { slug: string };
  searchParams: { lesson?: string };
}

export const metadata: Metadata = {
  title: 'Learning',
  robots: { index: false, follow: false },
};

export default async function CoursePlayerPage({ params, searchParams }: PageProps) {
  const data = await getUserWithProfile();

  if (!data?.user) {
    redirect(`/login?redirect=/dashboard/courses/${params.slug}`);
  }

  const [course, purchase] = await Promise.all([
    getCourseBySlug(params.slug),
    data.user ? getCourseBySlug(params.slug).then(
      (c) => c ? getUserCoursePurchase(data.user!.id, c.id) : null
    ) : null,
  ]);

  if (!course) notFound();

  // Gate: user must own the course
  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/25
                        flex items-center justify-center mb-5">
          <Lock className="w-7 h-7 text-brand-light" />
        </div>
        <h1 className="font-display text-2xl font-black text-text-primary mb-2">
          Course not purchased
        </h1>
        <p className="text-text-secondary text-sm max-w-xs mb-6">
          You haven&apos;t purchased &quot;{course.title}&quot; yet. Buy it to unlock all lessons.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" asChild>
            <Link href={`/courses/${course.slug}`}>View Course</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = await getCourseProgress(data.user.id, course.id);

  // Determine initial lesson
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const requestedLesson = searchParams.lesson
    ? allLessons.find((l) => l.id === searchParams.lesson)
    : null;

  // Default: first incomplete lesson, or first lesson
  const firstIncomplete = allLessons.find(
    (l) => !progress.find((p) => p.lesson_id === l.id && p.completed)
  );
  const initialLesson = requestedLesson ?? firstIncomplete ?? allLessons[0] ?? null;

  return (
    <CoursePlayerClient
      course={course}
      initialLesson={initialLesson}
      progress={progress}
      userId={data.user.id}
    />
  );
}
