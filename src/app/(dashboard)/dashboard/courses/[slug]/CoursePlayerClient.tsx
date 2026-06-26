"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, CheckCircle2, X,
  BookOpen, Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CourseCurriculum } from "@/components/courses/CourseCurriculum";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/format";
import type { CourseLesson, CourseProgress } from "@/types/database.types";
import type { CourseWithModules } from "@/lib/queries/courses";

interface Props {
  course: CourseWithModules;
  initialLesson: CourseLesson | null;
  progress: CourseProgress[];
  userId: string;
}

export function CoursePlayerClient({ course, initialLesson, progress, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(initialLesson);
  const [localProgress, setLocalProgress] = useState<CourseProgress[]>(progress);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);

  // Debounce timer ref for progress saves
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = activeLesson
    ? allLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = localProgress.filter((p) => p.completed).length;
  const totalLessons = allLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentCompleted = activeLesson
    ? !!localProgress.find((p) => p.lesson_id === activeLesson.id && p.completed)
    : false;

  // Update URL when lesson changes (no page reload)
  useEffect(() => {
    if (activeLesson) {
      const url = `/dashboard/courses/${course.slug}?lesson=${activeLesson.id}`;
      router.replace(url, { scroll: false });
    }
  }, [activeLesson, course.slug, router]);

  const saveProgress = useCallback(
    async (lessonId: string, completed: boolean, watchedPct: number) => {
      // Optimistic local update
      setLocalProgress((prev) => {
        const existing = prev.findIndex((p) => p.lesson_id === lessonId);
        const entry: CourseProgress = {
          id: prev[existing]?.id ?? crypto.randomUUID(),
          user_id: userId,
          course_id: course.id,
          lesson_id: lessonId,
          completed,
          watched_pct: watchedPct,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = entry;
          return next;
        }
        return [...prev, entry];
      });

      // Debounced DB write (max 1 write per 5 seconds per lesson)
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await supabase.from("course_progress").upsert(
          {
            user_id: userId,
            course_id: course.id,
            lesson_id: lessonId,
            completed,
            watched_pct: watchedPct,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,lesson_id" }
        );
      }, 5000);
    },
    [supabase, userId, course.id]
  );

  const markComplete = useCallback(async () => {
    if (!activeLesson || isCurrentCompleted) return;
    setMarkingDone(true);
    await saveProgress(activeLesson.id, true, 100);
    setMarkingDone(false);
    // Auto-advance after 800ms
    if (nextLesson) {
      setTimeout(() => setActiveLesson(nextLesson), 800);
    }
  }, [activeLesson, isCurrentCompleted, saveProgress, nextLesson]);

  // Extract YouTube video ID
  const getVideoId = (url: string) =>
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1] ?? null;

  const videoId = activeLesson ? getVideoId(activeLesson.youtube_url) : null;

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg-base/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto",
          "w-80 shrink-0 flex flex-col bg-bg-surface border-l border-bg-border",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-bg-border">
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-0.5">
              Course Content
            </p>
            <p className="text-sm font-semibold text-text-primary line-clamp-1">
              {course.title}
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary
                       hover:bg-bg-elevated transition-colors ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-bg-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-muted">
              {completedCount}/{totalLessons} completed
            </span>
            <span className="text-xs font-bold text-brand-light">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {progressPct === 100 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent">Course complete!</span>
            </div>
          )}
        </div>

        {/* Curriculum scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <CourseCurriculum
            modules={course.modules}
            progress={localProgress}
            isPurchased
            activeLessonId={activeLesson?.id}
            onLessonClick={(lesson) => {
              setActiveLesson(lesson);
              setSidebarOpen(false);
            }}
          />
        </div>
      </aside>

      {/* ── Main player ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-bg-border
                           bg-bg-surface shrink-0">
          <Button variant="ghost" size="icon-sm" asChild>
            <a href="/dashboard">
              <ChevronLeft className="w-4 h-4" />
            </a>
          </Button>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted truncate">{course.title}</p>
            {activeLesson && (
              <p className="text-sm font-semibold text-text-primary truncate">
                {activeLesson.title}
              </p>
            )}
          </div>

          {/* Mobile: sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary
                       hover:bg-bg-elevated transition-colors"
            aria-label="Open course content"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </header>

        {/* Video area */}
        <div className="flex-1 overflow-y-auto">
          {videoId ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key={videoId}
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=0`}
                title={activeLesson?.title ?? "Lesson"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full bg-black"
              />
            </div>
          ) : (
            <div className="aspect-video bg-bg-elevated flex items-center justify-center">
              <p className="text-text-muted text-sm">No video for this lesson.</p>
            </div>
          )}

          {/* Lesson controls */}
          {activeLesson && (
            <div className="p-4 md:p-6 space-y-4 pb-24 lg:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-xl md:text-2xl font-black text-text-primary">
                    {activeLesson.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrentCompleted ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                                    bg-success/10 border border-success/25 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Completed</span>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={markComplete}
                      loading={markingDone}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center gap-3 pt-2 border-t border-bg-border">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() => prevLesson && setActiveLesson(prevLesson)}
                  disabled={!prevLesson}
                >
                  Previous
                </Button>

                <div className="flex-1 text-center text-xs text-text-muted">
                  {currentIndex + 1} / {totalLessons}
                </div>

                <Button
                  variant={nextLesson ? "primary" : "secondary"}
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => nextLesson && setActiveLesson(nextLesson)}
                  disabled={!nextLesson}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
