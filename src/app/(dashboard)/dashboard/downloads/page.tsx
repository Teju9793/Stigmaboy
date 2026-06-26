import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserWithProfile } from "@/lib/supabase/server";
import { getUserPurchasedTemplates } from "@/lib/queries/templates";
import { Button } from "@/components/ui/Button";
import { Download, Package } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Downloads — Dashboard",
  robots: { index: false },
};

export default async function DashboardDownloadsPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const templates = await getUserPurchasedTemplates(data.user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">
          Downloads
        </h1>
        <p className="text-text-muted text-sm mt-1">
          All your purchased and free files — download any time.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center
                        border border-dashed border-bg-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20
                          flex items-center justify-center mb-5">
            <Download className="w-7 h-7 text-brand-light" />
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">
            No downloads yet
          </h2>
          <p className="text-text-muted text-sm max-w-xs mb-6">
            Purchase a template or grab a free resource to see it here.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="primary" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/resources">Free Resources</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-bg-border">
            <p className="text-sm font-semibold text-text-primary">
              {templates.length} {templates.length === 1 ? "file" : "files"} available
            </p>
          </div>
          <div className="divide-y divide-bg-border">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-bg-elevated
                           transition-colors"
              >
                <div className="relative w-14 h-10 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                  {template.thumbnail_url ? (
                    <Image
                      src={template.thumbnail_url}
                      alt={template.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-4 h-4 text-brand/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">
                    {template.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {template.software?.join(" · ") ?? "Template"}
                    {template.file_size && ` · ${formatFileSize(template.file_size)}`}
                  </p>
                </div>

                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/api/downloads/template/${template.id}`}>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
