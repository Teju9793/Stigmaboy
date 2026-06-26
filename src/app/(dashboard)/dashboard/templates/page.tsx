import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserWithProfile } from "@/lib/supabase/server";
import { getUserPurchasedTemplates } from "@/lib/queries/templates";
import { Button } from "@/components/ui/Button";
import { Download, Package, ArrowRight } from "lucide-react";
import { formatPrice, formatFileSize } from "@/lib/utils/format";
import Image from "next/image";
import type { Template } from "@/types/database.types";

export const metadata: Metadata = {
  title: "My Templates — Dashboard",
  robots: { index: false },
};

export default async function DashboardTemplatesPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const templates = await getUserPurchasedTemplates(data.user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-text-primary">
            My Templates
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {templates.length} {templates.length === 1 ? "template" : "templates"} owned
          </p>
        </div>
        <Button variant="primary" size="sm" asChild>
          <Link href="/templates">
            Browse More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateDownloadRow key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateDownloadRow({ template }: { template: Template }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-bg-surface border border-bg-border
                    rounded-2xl hover:border-brand/25 transition-colors">
      {/* Thumbnail */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/templates/${template.slug}`}
          className="text-sm font-semibold text-text-primary hover:text-brand-light
                     transition-colors line-clamp-1"
        >
          {template.title}
        </Link>
        <p className="text-xs text-text-muted mt-0.5">
          {template.software?.join(" · ") ?? "Template"}
          {template.file_size && ` · ${formatFileSize(template.file_size)}`}
        </p>
      </div>

      {/* Price paid + download */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-text-muted hidden sm:block">
          {template.is_free ? "Free" : formatPrice(template.price)}
        </span>
        <Button variant="primary" size="sm" asChild>
          <Link href={`/api/downloads/template/${template.id}`}>
            <Download className="w-3.5 h-3.5" />
            Download
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center
                    border border-dashed border-bg-border rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20
                      flex items-center justify-center mb-5">
        <Package className="w-7 h-7 text-brand-light" />
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary mb-2">
        No templates yet
      </h2>
      <p className="text-text-muted text-sm max-w-xs mb-6">
        Browse our premium Premiere Pro and After Effects templates.
      </p>
      <Button variant="primary" asChild>
        <Link href="/templates">Browse Templates</Link>
      </Button>
    </div>
  );
}
