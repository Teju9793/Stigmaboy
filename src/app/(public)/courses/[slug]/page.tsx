import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Clock, BookOpen, Users, CheckCircle2,
  Lock, Play, ArrowLeft,
} from "lucide-react";
import { getCourseBySlug, getUserCoursePurchase } from "@/lib/queries/courses";
import { getUser } from "@/lib/supabase/server";
import { CourseCurriculum } from "@/components/courses/CourseCurriculum";
import { AddToCartButton } from "@/components/courses/AddToCartButton";
import { DifficultyBadge } from "@/components/courses/CourseCard";
import { Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import {
  formatPrice, formatTotalDuration,
  discountPercent, formatDate,
} from "@/lib/utils/format";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.subtitle ?? course.description ?? undefined,
    openGraph: {
      title: `${course.title} — STIGMABOY`,
      description: course.subtitle ?? undefined,
      images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [],
    },
  };
}

export const revalidate = 600;

export default async function CourseDetailPage({ params }: PageProps) {
  const [course, user] = await Promise.all([
    getCourseBySlug(params.slug),
    getUser(),
  ]);

  if (!course) notFound();

  const purchase = user
    ? await getUserCoursePurchase(user.id, course.id)
    : null;

  const isPurchased = !!purchase;
  const discount = course.original_price
    ? discountPercent(course.original_price, course.price)
    : 0;

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.length, 0
  );
  const previewLessons = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.is_preview);

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: "STIGMABOY" },
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    ...(course.average_rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: course.average_rating,
        reviewCount: course.total_reviews,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero banner ────────────────────────────────────── */}
      <div className="bg-bg-surface border-b border-bg-border">
        <div className="section-container py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* Left: info */}
            <div className="lg:col-span-3 space-y-5">
              {/* Breadcrumb */}
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-xs text-text-muted
                           hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Courses
              </Link>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {course.difficulty && (
                  <DifficultyBadge difficulty={course.difficulty} />
                )}
                {course.is_featured && (
                  <Badge variant="accent">⭐ Featured</Badge>
                )}
                {isPurchased && (
                  <Badge variant="success">✓ Enrolled</Badge>
                )}
                {course.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black
                             text-text-primary leading-tight">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-lg text-text-secondary leading-relaxed">
                  {course.subtitle}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {course.average_rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-text-primary font-bold">
                      {course.average_rating.toFixed(1)}
                    </span>
                    <span>({course.total_reviews} reviews)</span>
                  </span>
                )}
                {course.total_students > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {course.total_students.toLocaleString("en-IN")} students
                  </span>
                )}
                {totalLessons > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {totalLessons} lessons
                  </span>
                )}
                {course.total_duration > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatTotalDuration(course.total_duration)}
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted">
                Last updated {formatDate(course.updated_at)}
              </p>
            </div>

            {/* Right: purchase card (desktop) */}
            <div className="lg:col-span-2">
              <PurchaseCard
                course={course}
                isPurchased={isPurchased}
                discount={discount}
                previewCount={previewLessons.length}
                totalLessons={totalLessons}
                userId={user?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left: description + curriculum */}
          <div className="lg:col-span-3 space-y-10">

            {/* Preview video (if set) */}
            {course.preview_video && !isPurchased && (
              <div>
                <h2 className="font-display text-2xl font-black text-text-primary mb-4">
                  Preview
                </h2>
                <YouTubeEmbed url={course.preview_video} title={`${course.title} — Preview`} />
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div>
                <h2 className="font-display text-2xl font-black text-text-primary mb-4">
                  About this course
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed">
                  {course.description.split("\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* What you'll learn */}
            {course.tags && course.tags.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-black text-text-primary mb-4">
                  What you&apos;ll learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.tags.map((tag) => (
                    <div key={tag} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.modules.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-2xl font-black text-text-primary">
                    Course Curriculum
                  </h2>
                  <span className="text-xs text-text-muted">
                    {course.modules.length} modules · {totalLessons} lessons
                  </span>
                </div>
                <CourseCurriculum
                  modules={course.modules}
                  isPurchased={isPurchased}
                />
              </div>
            )}
          </div>

          {/* Right: sticky purchase card (desktop sidebar) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <PurchaseCard
                course={course}
                isPurchased={isPurchased}
                discount={discount}
                previewCount={previewLessons.length}
                totalLessons={totalLessons}
                userId={user?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ──────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4
                      bg-bg-elevated/95 backdrop-blur-xl border-t border-bg-border">
        {isPurchased ? (
          <Button variant="primary" size="lg" fullWidth asChild>
            <Link href={`/dashboard/courses/${course.slug}`}>
              <Play className="w-4 h-4 fill-current" />
              Continue Learning
            </Link>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-display font-black text-xl text-text-primary">
                {formatPrice(course.price)}
              </p>
              {course.original_price && (
                <p className="text-xs text-text-muted line-through">
                  {formatPrice(course.original_price)}
                </p>
              )}
            </div>
            <div className="flex-1">
              <AddToCartButton
                item={{
                  id: course.id,
                  type: "course",
                  title: course.title,
                  price: course.price,
                  thumbnail_url: course.thumbnail_url,
                  slug: course.slug,
                }}
                fullWidth
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Purchase Card ────────────────────────────────────────────────────────────

function PurchaseCard({
  course,
  isPurchased,
  discount,
  previewCount,
  totalLessons,
  userId,
}: {
  course: { id: string; price: number; original_price: number | null;
            thumbnail_url: string | null; title: string; slug: string;
            total_duration: number; };
  isPurchased: boolean;
  discount: number;
  previewCount: number;
  totalLessons: number;
  userId?: string;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden shadow-card">
      {/* Thumbnail preview */}
      {course.thumbnail_url && (
        <div className="relative aspect-video">
          <Image
            src={course.thumbnail_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-bg-base/40 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-brand/90 flex items-center justify-center
                            shadow-brand-glow">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {isPurchased ? (
          <>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/25">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-sm font-semibold text-success">
                You&apos;re enrolled in this course
              </p>
            </div>
            <Button variant="primary" size="lg" fullWidth asChild>
              <Link href={`/dashboard/courses/${course.slug}`}>
                <Play className="w-4 h-4 fill-current" />
                Continue Learning
              </Link>
            </Button>
          </>
        ) : (
          <>
            {/* Price block */}
            <div className="flex items-end gap-3">
              <span className="font-display font-black text-4xl text-text-primary">
                {formatPrice(course.price)}
              </span>
              {course.original_price && (
                <div className="pb-1 space-y-0.5">
                  <span className="text-sm text-text-muted line-through block">
                    {formatPrice(course.original_price)}
                  </span>
                  {discount > 0 && (
                    <span className="badge bg-error/15 text-error border-error/25 text-2xs">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="space-y-2.5">
              <AddToCartButton
                item={{
                  id: course.id,
                  type: "course",
                  title: course.title,
                  price: course.price,
                  thumbnail_url: course.thumbnail_url,
                  slug: course.slug,
                }}
                fullWidth
              />
              {!userId && (
                <p className="text-xs text-center text-text-muted">
                  <Link href="/login" className="text-brand-light hover:underline">
                    Sign in
                  </Link>{" "}
                  to purchase
                </p>
              )}
            </div>
          </>
        )}

        {/* Course includes */}
        <div className="pt-2 border-t border-bg-border space-y-2.5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            This course includes
          </p>
          {[
            totalLessons > 0 && `${totalLessons} lessons`,
            course.total_duration > 0 &&
              `${formatTotalDuration(course.total_duration)} of content`,
            previewCount > 0 && `${previewCount} free preview lessons`,
            "Lifetime access",
            "Mobile & desktop",
          ]
            .filter(Boolean)
            .map((item) => (
              <div key={String(item)} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                {item}
              </div>
            ))}
        </div>

        {/* Lock notice for non-buyers */}
        {!isPurchased && (
          <div className="flex items-start gap-2 pt-1">
            <Lock className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">
              Purchase unlocks all lessons instantly. 100% secure checkout via Razorpay.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── YouTube embed ────────────────────────────────────────────────────────────

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  // Extract video ID from any YouTube URL format
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = match?.[1];
  if (!videoId) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg-elevated">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
