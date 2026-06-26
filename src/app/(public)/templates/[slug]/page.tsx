import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Download, Star, ArrowLeft, CheckCircle2,
  Lock, Zap,
} from "lucide-react";
import {
  getTemplateBySlug,
  getUserTemplatePurchase,
  isInWishlist,
} from "@/lib/queries/templates";
import { getUser } from "@/lib/supabase/server";
import { WishlistButton } from "@/components/templates/WishlistButton";
import { AddToCartButton } from "@/components/courses/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/index";
import {
  formatPrice,
  formatFileSize,
  discountPercent,
  formatDate,
} from "@/lib/utils/format";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const template = await getTemplateBySlug(params.slug);
  if (!template) return { title: "Template Not Found" };
  return {
    title: template.title,
    description: template.description ?? undefined,
    openGraph: {
      title: `${template.title} — STIGMABOY`,
      description: template.description ?? undefined,
      images: template.thumbnail_url ? [{ url: template.thumbnail_url }] : [],
    },
  };
}

export const revalidate = 600;

export default async function TemplateDetailPage({ params }: PageProps) {
  const [template, user] = await Promise.all([
    getTemplateBySlug(params.slug),
    getUser(),
  ]);

  if (!template) notFound();

  const [purchase, wishlisted] = await Promise.all([
    user ? getUserTemplatePurchase(user.id, template.id) : null,
    user ? isInWishlist(user.id, "template", template.id) : false,
  ]);

  const isPurchased = !!purchase;
  const discount = template.original_price
    ? discountPercent(template.original_price, template.price)
    : 0;

  const category = template.category as { name: string; slug: string } | null;

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: template.title,
    description: template.description,
    brand: { "@type": "Brand", name: "STIGMABOY" },
    offers: {
      "@type": "Offer",
      price: template.is_free ? 0 : template.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    ...(template.average_rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: template.average_rating,
        reviewCount: template.total_reviews,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-bg-surface border-b border-bg-border">
        <div className="section-container py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* Left */}
            <div className="lg:col-span-3 space-y-5">
              <Link
                href="/templates"
                className="inline-flex items-center gap-1.5 text-xs text-text-muted
                           hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Templates
              </Link>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {template.is_free && <Badge variant="success">FREE</Badge>}
                {template.is_featured && <Badge variant="accent">⭐ Featured</Badge>}
                {isPurchased && <Badge variant="brand">✓ Owned</Badge>}
                {category && (
                  <Badge variant="default">{category.name}</Badge>
                )}
                {discount > 0 && !template.is_free && (
                  <Badge variant="error">-{discount}% OFF</Badge>
                )}
              </div>

              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black
                             text-text-primary leading-tight">
                {template.title}
              </h1>

              {template.description && (
                <p className="text-lg text-text-secondary leading-relaxed">
                  {template.description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {template.average_rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-text-primary font-bold">
                      {template.average_rating.toFixed(1)}
                    </span>
                    <span>({template.total_reviews} reviews)</span>
                  </span>
                )}
                {template.total_sales > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    {template.total_sales.toLocaleString("en-IN")} downloads
                  </span>
                )}
                {template.file_size && (
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    {formatFileSize(template.file_size)}
                  </span>
                )}
              </div>

              {template.software && template.software.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {template.software.map((sw) => (
                    <span
                      key={sw}
                      className="badge bg-bg-elevated border border-bg-border text-text-secondary text-xs"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-text-muted">
                Updated {formatDate(template.updated_at)}
              </p>
            </div>

            {/* Right: purchase card */}
            <div className="lg:col-span-2">
              <TemplatePurchaseCard
                template={template}
                isPurchased={isPurchased}
                isFree={template.is_free}
                discount={discount}
                userId={user?.id ?? null}
                wishlisted={wishlisted}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-10">

            {/* Preview video */}
            {template.preview_video && (
              <div>
                <h2 className="font-display text-2xl font-black text-text-primary mb-4">
                  Preview
                </h2>
                <TemplateVideoPreview url={template.preview_video} title={template.title} />
              </div>
            )}

            {/* Thumbnail */}
            {!template.preview_video && template.thumbnail_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={template.thumbnail_url}
                  alt={template.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* What's included */}
            {template.tags && template.tags.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-black text-text-primary mb-4">
                  What&apos;s included
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {template.tags.map((tag) => (
                    <div key={tag} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar (desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24">
              <TemplatePurchaseCard
                template={template}
                isPurchased={isPurchased}
                isFree={template.is_free}
                discount={discount}
                userId={user?.id ?? null}
                wishlisted={wishlisted}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4
                      bg-bg-elevated/95 backdrop-blur-xl border-t border-bg-border">
        {isPurchased || template.is_free ? (
          <DownloadOrGetButton
            templateId={template.id}
            isFree={template.is_free}
            isPurchased={isPurchased}
            userId={user?.id ?? null}
            fullWidth
          />
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-display font-black text-xl text-text-primary">
                {formatPrice(template.price)}
              </p>
              {template.original_price && (
                <p className="text-xs text-text-muted line-through">
                  {formatPrice(template.original_price)}
                </p>
              )}
            </div>
            <div className="flex-1">
              <AddToCartButton
                item={{
                  id: template.id,
                  type: "template",
                  title: template.title,
                  price: template.price,
                  thumbnail_url: template.thumbnail_url,
                  slug: template.slug,
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

function TemplatePurchaseCard({
  template,
  isPurchased,
  isFree,
  discount,
  userId,
  wishlisted,
}: {
  template: {
    id: string; price: number; original_price: number | null;
    thumbnail_url: string | null; title: string; slug: string;
    file_size: number | null; software: string[] | null; is_free: boolean;
  };
  isPurchased: boolean;
  isFree: boolean;
  discount: number;
  userId: string | null;
  wishlisted: boolean;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden shadow-card">
      {/* Thumbnail */}
      {template.thumbnail_url && (
        <div className="relative aspect-video">
          <Image
            src={template.thumbnail_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="p-6 space-y-5">
        {isPurchased || isFree ? (
          <>
            {(isPurchased || isFree) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/25">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <p className="text-sm font-semibold text-success">
                  {isFree ? "Free download — no purchase needed" : "You own this template"}
                </p>
              </div>
            )}
            <DownloadOrGetButton
              templateId={template.id}
              isFree={isFree}
              isPurchased={isPurchased}
              userId={userId}
              fullWidth
            />
          </>
        ) : (
          <>
            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-display font-black text-4xl text-text-primary">
                {formatPrice(template.price)}
              </span>
              {template.original_price && (
                <div className="pb-1 space-y-0.5">
                  <span className="text-sm text-text-muted line-through block">
                    {formatPrice(template.original_price)}
                  </span>
                  {discount > 0 && (
                    <span className="badge bg-error/15 text-error border-error/25 text-2xs">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* CTA + Wishlist */}
            <div className="flex gap-2">
              <div className="flex-1">
                <AddToCartButton
                  item={{
                    id: template.id,
                    type: "template",
                    title: template.title,
                    price: template.price,
                    thumbnail_url: template.thumbnail_url,
                    slug: template.slug,
                  }}
                  fullWidth
                />
              </div>
              <WishlistButton
                itemId={template.id}
                itemType="template"
                initialState={wishlisted}
                userId={userId}
              />
            </div>

            {!userId && (
              <p className="text-xs text-center text-text-muted">
                <Link href="/login" className="text-brand-light hover:underline">
                  Sign in
                </Link>{" "}
                to purchase
              </p>
            )}
          </>
        )}

        {/* Includes */}
        <div className="pt-2 border-t border-bg-border space-y-2.5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            File details
          </p>
          {[
            template.file_size && `${formatFileSize(template.file_size)} download`,
            template.software?.length && `Works with ${template.software.join(", ")}`,
            "Instant access after purchase",
            "Lifetime download access",
          ]
            .filter(Boolean)
            .map((item) => (
              <div
                key={String(item)}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                {item}
              </div>
            ))}
        </div>

        {/* Security note */}
        {!isPurchased && !isFree && (
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">
              Secure download link generated after purchase. 100% via Razorpay.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Download / Free gate button ──────────────────────────────────────────────

function DownloadOrGetButton({
  templateId,
  isFree,
  isPurchased,
  userId,
  fullWidth = false,
}: {
  templateId: string;
  isFree: boolean;
  isPurchased: boolean;
  userId: string | null;
  fullWidth?: boolean;
}) {
  if (!userId && isFree) {
    // Free but not logged in — redirect to register (collects email via subscribe)
    return (
      <Button variant="cta" size="lg" fullWidth={fullWidth} asChild>
        <Link href={`/register?next=/templates`}>
          <Download className="w-4 h-4" />
          Get Free Template
        </Link>
      </Button>
    );
  }

  if (isPurchased || (isFree && userId)) {
    return (
      <Button variant="primary" size="lg" fullWidth={fullWidth} asChild>
        <Link href={`/api/downloads/template/${templateId}`}>
          <Download className="w-4 h-4" />
          Download Now
        </Link>
      </Button>
    );
  }

  return null;
}

// ─── Video preview ────────────────────────────────────────────────────────────

function TemplateVideoPreview({ url, title }: { url: string; title: string }) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = match?.[1];

  if (!videoId) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg-elevated">
        <video
          src={url}
          controls
          className="absolute inset-0 w-full h-full"
          title={title}
        />
      </div>
    );
  }

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
