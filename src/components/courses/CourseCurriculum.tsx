"use client";

import { useState } from "react";
import { ChevronDown, Play, Lock, CheckCircle2, Clock } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils/format";
import type { CourseLesson, CourseModule, CourseProgress } from "@/types/database.types";

interface Module extends CourseModule {
  lessons: CourseLesson[];
}

interface CurriculumProps {
  modules: Module[];
  progress?: CourseProgress[];
  isPurchased?: boolean;
  onLessonClick?: (lesson: CourseLesson) => void;
  activeLessonId?: string;
}

export function CourseCurriculum({
  modules,
  progress = [],
  isPurchased = false,
  onLessonClick,
  activeLessonId,
}: CurriculumProps) {
  // Open first module by default
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set(modules[0]?.id ? [modules[0].id] : [])
  );

  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]));

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = progress.filter((p) => p.completed).length;

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {/* Summary row */}
      {isPurchased && totalLessons > 0 && (
        <div className="flex items-center justify-between px-1 mb-4">
          <p className="text-xs text-text-muted">
            <span className="text-text-primary font-semibold">{completedCount}</span>
            {" / "}
            <span>{totalLessons}</span> lessons completed
          </p>
          {/* Progress bar */}
          <div className="w-32 h-1.5 bg-bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gradient rounded-full transition-all duration-500"
              style={{
                width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {modules.map((module, moduleIdx) => {
        const isOpen = openModules.has(module.id);
        const moduleCompleted = module.lessons.every(
          (l) => progressMap.get(l.id)?.completed
        );

        return (
          <div
            key={module.id}
            className="border border-bg-border rounded-2xl overflow-hidden"
          >
            {/* Module header */}
            <button
              onClick={() => toggleModule(module.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 text-left",
                "transition-colors duration-150",
                isOpen ? "bg-bg-elevated" : "bg-bg-surface hover:bg-bg-elevated"
              )}
              aria-expanded={isOpen}
            >
              {/* Module number */}
              <span
                className={cn(
                  "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                  moduleCompleted && isPurchased
                    ? "bg-success/15 text-success"
                    : "bg-brand/10 text-brand-light"
                )}
              >
                {moduleCompleted && isPurchased ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  moduleIdx + 1
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  {module.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {module.lessons.length} lessons
                  {isPurchased &&
                    ` · ${module.lessons.filter((l) => progressMap.get(l.id)?.completed).length} done`}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "w-4 h-4 text-text-muted shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {/* Lessons list */}
            {isOpen && (
              <div className="divide-y divide-bg-border">
                {module.lessons.map((lesson) => {
                  const lessonProgress = progressMap.get(lesson.id);
                  const isCompleted = lessonProgress?.completed ?? false;
                  const isActive = activeLessonId === lesson.id;
                  const canAccess = isPurchased || lesson.is_preview;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => canAccess && onLessonClick?.(lesson)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 transition-all duration-150",
                        canAccess && "cursor-pointer",
                        isActive
                          ? "bg-brand/10 border-l-2 border-brand"
                          : canAccess
                          ? "hover:bg-bg-elevated"
                          : "opacity-60 cursor-default"
                      )}
                    >
                      {/* Status icon */}
                      <div
                        className={cn(
                          "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                          isActive
                            ? "bg-brand text-white"
                            : isCompleted
                            ? "bg-success/15 text-success"
                            : canAccess
                            ? "bg-bg-elevated text-text-muted border border-bg-border"
                            : "bg-bg-elevated text-text-muted border border-bg-border"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isActive ? (
                          <Play className="w-3 h-3 fill-white" />
                        ) : canAccess ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>

                      {/* Lesson title */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            isActive
                              ? "text-brand-light font-semibold"
                              : isCompleted
                              ? "text-text-muted line-through"
                              : "text-text-secondary"
                          )}
                        >
                          {lesson.title}
                        </p>
                        {lesson.is_preview && !isPurchased && (
                          <span className="text-2xs font-semibold text-accent mt-0.5 block">
                            Free preview
                          </span>
                        )}
                      </div>

                      {/* Duration */}
                      {lesson.duration && (
                        <span className="shrink-0 flex items-center gap-1 text-2xs text-text-muted">
                          <Clock className="w-3 h-3" />
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
