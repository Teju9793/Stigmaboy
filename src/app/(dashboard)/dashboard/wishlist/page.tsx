import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserWithProfile } from "@/lib/supabase/server";
import { getUserWishlist } from "@/lib/queries/templates";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Heart } from "lucide-react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { CourseCard } from "@/components/courses/CourseCard";
import type { Template, Course } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Wishlist — Dashboard",
  robots: { index: false },
};

export default async function DashboardWishlistPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const wishlist = await getUserWishlist(data.user.id);

  if (wishlist.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <h1 className="font-display text-3xl font-black text-text-primary">Wishlist</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center
                        border border-dashed border-bg-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20
                          flex items-center justify-center mb-5">
            <Heart className="w-7 h-7 text-error" />
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-text-muted text-sm max-w-xs mb-6">
            Save courses and templates you like using the heart icon.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="primary" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch actual items
  const supabase = createClient();
  const courseIds = wishlist.filter((w) => w.item_type === "course").map((w) => w.item_id);
  const templateIds = wishlist.filter((w) => w.item_type === "template").map((w) => w.item_id);

  const [coursesRes, templatesRes] = await Promise.all([
    courseIds.length
      ? supabase.from("courses").select("*").in("id", courseIds).eq("is_published", true)
      : { data: [] },
    templateIds.length
      ? supabase.from("templates").select("*, category:template_categories(id,name,slug)").in("id", templateIds).eq("is_published", true)
      : { data: [] },
  ]);

  const courses = (coursesRes.data ?? []) as Course[];
  const templates = (templatesRes.data ?? []) as Template[];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-text-primary">Wishlist</h1>
          <p className="text-text-muted text-sm mt-1">
            {wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {courses.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-text-primary mb-4">
            Courses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {templates.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-text-primary mb-4">
            Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
