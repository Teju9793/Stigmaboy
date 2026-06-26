import Link from "next/link";
import Image from "next/image";
import { Star, Download, Package, Zap } from "lucide-react";
import { formatPrice, formatFileSize, discountPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import type { Template } from "@/types/database.types";

interface TemplateCardProps {
  template: Template;
  purchased?: boolean;
  wishlisted?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export function TemplateCard({
  template,
  purchased = false,
  className,
  variant = "default",
}: TemplateCardProps) {
  const discount = template.original_price
    ? discountPercent(template.original_price, template.price)
    : 0;

  if (variant === "compact") {
    return (
      <TemplateCardCompact
        template={template}
        purchased={purchased}
        className={className}
      />
    );
  }

  return (
    <Link
      href={`/templates/${template.slug}`}
      className={cn(
        "group flex flex-col bg-bg-surface border border-bg-border rounded-2xl overflow-hidden",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand/30",
        "hover:shadow-card-hover",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-bg-elevated overflow-hidden">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-brand/20" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {template.is_free && (
            <span className="badge bg-success text-white text-2xs font-bold border-0">
              FREE
            </span>
          )}
          {template.is_featured && (
            <span className="badge bg-accent text-bg-base text-2xs font-bold border-0">
              ⭐ Featured
            </span>
          )}
          {purchased && (
            <span className="badge bg-brand/90 text-white text-2xs font-bold border-0">
              ✓ Owned
            </span>
          )}
          {discount > 0 && !template.is_free && (
            <span className="badge bg-error text-white text-2xs font-bold border-0">
              -{discount}%
            </span>
          )}
        </div>

        {/* Software tags */}
        {template.software && template.software.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
            {template.software.slice(0, 2).map((sw) => (
              <span
                key={sw}
                className="badge bg-bg-base/80 text-text-secondary border-bg-border text-2xs backdrop-blur-sm"
              >
                {sw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        {template.category && (
          <p className="text-2xs font-bold uppercase tracking-widest text-brand-light mb-2">
            {(template.category as { name: string }).name}
          </p>
        )}

        <h3 className="font-display font-bold text-base text-text-primary leading-snug
                       mb-3 line-clamp-2 group-hover:text-brand-light transition-colors duration-200">
          {template.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-text-muted mt-auto mb-4">
          {template.total_sales > 0 && (
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {template.total_sales.toLocaleString("en-IN")} sales
            </span>
          )}
          {template.file_size && (
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {formatFileSize(template.file_size)}
            </span>
          )}
        </div>

        {/* Rating + Price */}
        <div className="flex items-center justify-between">
          {template.total_reviews > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-semibold text-text-primary">
                {template.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-text-muted">
                ({template.total_reviews})
              </span>
            </div>
          ) : (
            <span className="text-xs text-text-muted">New</span>
          )}

          <div className="text-right">
            {template.is_free ? (
              <span className="font-display font-black text-lg text-success">Free</span>
            ) : (
              <>
                <span className="font-display font-black text-lg text-text-primary">
                  {formatPrice(template.price)}
                </span>
                {template.original_price && (
                  <span className="text-xs text-text-muted line-through ml-1.5">
                    {formatPrice(template.original_price)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Compact variant ──────────────────────────────────────────────────────────

function TemplateCardCompact({
  template,
  purchased,
  className,
}: {
  template: Template;
  purchased?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={
        purchased
          ? `/dashboard/templates`
          : `/templates/${template.slug}`
      }
      className={cn(
        "group flex items-center gap-4 p-4 bg-bg-surface border border-bg-border rounded-2xl",
        "hover:border-brand/30 transition-all duration-200",
        className
      )}
    >
      <div className="relative w-20 h-14 rounded-xl bg-bg-elevated overflow-hidden shrink-0">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-5 h-5 text-brand/30" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary line-clamp-1
                      group-hover:text-brand-light transition-colors">
          {template.title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {template.software?.join(" · ") ?? "Template"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {purchased ? (
          <span className="badge bg-brand/15 text-brand-light border-brand/25 text-2xs">
            Owned
          </span>
        ) : template.is_free ? (
          <span className="font-bold text-sm text-success">Free</span>
        ) : (
          <span className="font-bold text-sm text-text-primary">
            {formatPrice(template.price)}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function TemplateCardSkeleton() {
  return (
    <div className="flex flex-col bg-bg-surface border border-bg-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-bg-elevated" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-bg-elevated rounded w-1/4" />
        <div className="h-4 bg-bg-elevated rounded w-3/4" />
        <div className="h-3 bg-bg-elevated rounded w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-bg-elevated rounded w-16" />
          <div className="h-5 bg-bg-elevated rounded w-20" />
        </div>
      </div>
    </div>
  );
}
