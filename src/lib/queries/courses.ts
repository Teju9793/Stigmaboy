import { createClient } from "@/lib/supabase/server";
import type {
  Course,
  CourseModule,
  CourseLesson,
  CourseProgress,
  UserPurchase,
} from "@/types/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseWithModules extends Course {
  modules: (CourseModule & { lessons: CourseLesson[] })[];
}

export interface CoursesPageData {
  courses: Course[];
  total: number;
}

export interface CourseFilters {
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
}

// ─── Listing ──────────────────────────────────────────────────────────────────

export async function getCourses(filters: CourseFilters = {}): Promise<CoursesPageData> {
  const supabase = createClient();
  const {
    difficulty,
    search,
    sort = "newest",
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
  } = filters;

  let query = supabase
    .from("courses")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (difficulty && difficulty !== "all") {
    query = query.eq("difficulty", difficulty);
  }
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  switch (sort) {
    case "popular":
      query = query.order("total_students", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[getCourses]", error.message);
    return { courses: [], total: 0 };
  }

  return { courses: (data as Course[]) ?? [], total: count ?? 0 };
}

export async function getFeaturedCourses(limit = 3): Promise<Course[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data as Course[]) ?? [];
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getCourseBySlug(slug: string): Promise<CourseWithModules | null> {
  const supabase = createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !course) return null;

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  if (!modules?.length) {
    return { ...(course as Course), modules: [] };
  }

  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const lessonsMap = new Map<string, CourseLesson[]>();
  (lessons ?? []).forEach((l) => {
    const arr = lessonsMap.get(l.module_id) ?? [];
    arr.push(l as CourseLesson);
    lessonsMap.set(l.module_id, arr);
  });

  return {
    ...(course as Course),
    modules: (modules as CourseModule[]).map((m) => ({
      ...m,
      lessons: lessonsMap.get(m.id) ?? [],
    })),
  };
}

// ─── Purchase gate ────────────────────────────────────────────────────────────

export async function getUserCoursePurchase(
  userId: string,
  courseId: string
): Promise<UserPurchase | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "course")
    .eq("item_id", courseId)
    .single();
  return (data as UserPurchase) ?? null;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId);
  return (data as CourseProgress[]) ?? [];
}

export async function getUserPurchasedCourses(userId: string): Promise<Course[]> {
  const supabase = createClient();

  const { data: purchases } = await supabase
    .from("user_purchases")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", "course");

  if (!purchases?.length) return [];

  const ids = purchases.map((p) => p.item_id);
  const { data } = await supabase
    .from("courses")
    .select("*")
    .in("id", ids)
    .eq("is_published", true);

  return (data as Course[]) ?? [];
}
