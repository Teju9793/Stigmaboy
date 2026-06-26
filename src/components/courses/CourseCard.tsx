import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Play,
  Lock,
} from "lucide-react";
import {
  formatPrice,
  formatTotalDuration,
  discountPercent,
} from "@/lib/utils/format";
import type { Course } from "@/types/database.types";
import { cn } from "@/lib/utils/format";

interface CourseCardProps {
  course: Course;
  purchased?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export function CourseCard({
  course,
  purchased = false,
  className,
  variant = "default",
}: CourseCardProps) {
  const discount =
    course.original_price
      ? discountPercent(course.original_price, course.price)
      : 0;

  if (variant === "compact") {
    return <CourseCardCompact course={course} purchased={purchased} className={className} />;
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex flex-col bg-bg-surface border border-bg-border rounded-2xl overflow-hidden",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand/30",
        "hover:shadow-card-hover",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-bg-elevated overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-gradient opacity-20 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-brand/40" />
          </div>
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-bg-base/60 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center
                          shadow-brand-glow scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Badges row */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {course.is_featured && (
            <span className="badge bg-accent text-bg-base text-2xs font-bold border-0">
              ⭐ Featured
            </span>
          )}
          {purchased && (
            <span className="badge bg-success/90 text-white text-2xs font-bold border-0">
              ✓ Enrolled
            </span>
          )}
          {discount > 0 && (
            <span className="badge bg-error text-white text-2xs font-bold border-0">
              -{discount}%
            </span>
          )}
        </div>

        {/* Difficulty pill */}
        {course.difficulty && (
          <div className="absolute bottom-3 right-3">
            <DifficultyBadge difficulty={course.difficulty} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-bold text-base text-text-primary leading-snug
                       mb-2 line-clamp-2 group-hover:text-brand-light transition-colors duration-200">
          {course.title}
        </h3>

        {course.subtitle && (
          <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
            {course.subtitle}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-text-muted mt-auto mb-4">
          {course.total_lessons > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.total_lessons} lessons
            </span>
          )}
          {course.total_duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTotalDuration(course.total_duration)}
            </span>
          )}
          {course.total_students > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.total_students.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Rating + Price */}
        <div className="flex items-center justify-between">
          {course.total_reviews > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-semibold text-text-primary">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">
                ({course.total_reviews})
              </span>
            </div>
          ) : (
            <span className="text-xs text-text-muted">New</span>
          )}

          <div className="text-right">
            <span className="font-display font-black text-lg text-text-primary">
              {formatPrice(course.price)}
            </span>
            {course.original_price && (
              <span className="text-xs text-text-muted line-through ml-1.5">
                {formatPrice(course.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Compact variant (dashboard "my courses" list) ────────────────────────────

function CourseCardCompact({
  course,
  purchased,
  className,
}: {
  course: Course;
  purchased?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={
        purchased
          ? `/dashboard/courses/${course.slug}`
          : `/courses/${course.slug}`
      }
      className={cn(
        "group flex items-center gap-4 p-4 bg-bg-surface border border-bg-border rounded-2xl",
        "hover:border-brand/30 transition-all duration-200",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-14 rounded-xl bg-bg-elevated overflow-hidden shrink-0">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 bg-brand/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand/40" />
          </div>
        )}
        {purchased ? (
          <div className="absolute inset-0 bg-bg-base/50 flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-bg-base/60 flex items-center justify-center">
            <Lock className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary line-clamp-1
                      group-hover:text-brand-light transition-colors">
          {course.title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {course.total_lessons} lessons
          {course.total_duration > 0 && ` · ${formatTotalDuration(course.total_duration)}`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {purchased ? (
          <span className="badge bg-success/15 text-success border-success/25 text-2xs">
            Enrolled
          </span>
        ) : (
          <span className="font-bold text-sm text-text-primary">
            {formatPrice(course.price)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col bg-bg-surface border border-bg-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-bg-elevated" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-bg-elevated rounded-lg w-3/4" />
        <div className="h-3 bg-bg-elevated rounded-lg w-full" />
        <div className="h-3 bg-bg-elevated rounded-lg w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-bg-elevated rounded w-16" />
          <div className="h-5 bg-bg-elevated rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; className: string }> = {
    beginner: { label: "Beginner", className: "bg-success/80 text-white border-0" },
    intermediate: { label: "Intermediate", className: "bg-accent/80 text-bg-base border-0" },
    advanced: { label: "Advanced", className: "bg-error/80 text-white border-0" },
  };
  const config = map[difficulty] ?? { label: difficulty, className: "" };
  return (
    <span className={cn("badge text-2xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}
