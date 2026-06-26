import { createClient } from "@/lib/supabase/server";
import type {
  Template,
  TemplateCategory,
  UserPurchase,
  WishlistItem,
} from "@/types/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemplatesPageData {
  templates: Template[];
  total: number;
}

export interface TemplateFilters {
  category?: string;
  software?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFree?: boolean;
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("template_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as TemplateCategory[]) ?? [];
}

// ─── Listing ──────────────────────────────────────────────────────────────────

export async function getTemplates(
  filters: TemplateFilters = {}
): Promise<TemplatesPageData> {
  const supabase = createClient();
  const {
    category,
    software,
    search,
    isFree,
    sort = "newest",
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
  } = filters;

  let query = supabase
    .from("templates")
    .select("*, category:template_categories(id,name,slug)", { count: "exact" })
    .eq("is_published", true);

  if (category && category !== "all") {
    // Join on slug
    const { data: cat } = await supabase
      .from("template_categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (software) {
    query = query.contains("software", [software]);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (isFree === true) {
    query = query.eq("is_free", true);
  } else if (isFree === false) {
    query = query.eq("is_free", false);
  }

  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);

  switch (sort) {
    case "popular":
      query = query.order("total_sales", { ascending: false });
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
    console.error("[getTemplates]", error.message);
    return { templates: [], total: 0 };
  }

  return { templates: (data as Template[]) ?? [], total: count ?? 0 };
}

export async function getFeaturedTemplates(limit = 4): Promise<Template[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("templates")
    .select("*, category:template_categories(id,name,slug)")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data as Template[]) ?? [];
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*, category:template_categories(id,name,slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error || !data) return null;
  return data as Template;
}

// ─── Purchase gate ────────────────────────────────────────────────────────────

export async function getUserTemplatePurchase(
  userId: string,
  templateId: string
): Promise<UserPurchase | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("item_type", "template")
    .eq("item_id", templateId)
    .single();
  return (data as UserPurchase) ?? null;
}

export async function getUserPurchasedTemplates(userId: string): Promise<Template[]> {
  const supabase = createClient();
  const { data: purchases } = await supabase
    .from("user_purchases")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", "template");

  if (!purchases?.length) return [];
  const ids = purchases.map((p) => p.item_id);

  const { data } = await supabase
    .from("templates")
    .select("*, category:template_categories(id,name,slug)")
    .in("id", ids)
    .eq("is_published", true);

  return (data as Template[]) ?? [];
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  return (data as WishlistItem[]) ?? [];
}

export async function isInWishlist(
  userId: string,
  itemType: "course" | "template",
  itemId: string
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .single();
  return !!data;
}
