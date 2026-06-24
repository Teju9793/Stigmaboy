// ============================================================
// STIGMABOY — Database Types
// Auto-generated from schema — do not edit manually
// ============================================================

export type UserRole = "user" | "admin" | "creator";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type ItemType = "course" | "template";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced";
export type EditRequestStatus =
  | "new"
  | "reviewing"
  | "accepted"
  | "rejected"
  | "completed";
export type AnnouncementType = "info" | "warning" | "promo" | "new";
export type DiscountType = "percent" | "flat";

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  total_purchases: number;
  total_spent: number;
  xp_points: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  preview_video: string | null;
  price: number;
  original_price: number | null;
  is_published: boolean;
  is_featured: boolean;
  total_lessons: number;
  total_duration: number;
  difficulty: CourseDifficulty | null;
  tags: string[] | null;
  total_students: number;
  average_rating: number;
  total_reviews: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  youtube_url: string;
  duration: number | null;
  is_preview: boolean;
  sort_order: number;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  watched_pct: number;
  completed_at: string | null;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Template {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  preview_video: string | null;
  file_path: string;
  file_size: number | null;
  price: number;
  original_price: number | null;
  is_published: boolean;
  is_featured: boolean;
  is_free: boolean;
  software: string[] | null;
  tags: string[] | null;
  total_sales: number;
  average_rating: number;
  total_reviews: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: TemplateCategory;
}

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  file_path: string;
  file_size: number | null;
  is_published: boolean;
  is_featured: boolean;
  total_downloads: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: ResourceCategory;
}

export interface ResourceDownload {
  id: string;
  resource_id: string;
  email: string;
  user_id: string | null;
  downloaded_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_id: string | null;
  currency: string;
  notes: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: ItemType;
  item_id: string;
  title: string;
  price: number;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  order_id: string;
  item_type: ItemType;
  item_id: string;
  purchased_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  min_order_value: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  used_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  rating: number;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  // joined
  user?: Pick<UserProfile, "full_name" | "avatar_url" | "username">;
}

export interface EditRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  description: string;
  budget_range: string | null;
  reference_link: string | null;
  status: EditRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  user_id: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  type: AnnouncementType | null;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  added_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================================
// API / Cart Types
// ============================================================

export interface CartItem {
  id: string;
  type: ItemType;
  title: string;
  price: number;
  thumbnail_url: string | null;
  slug: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  coupon_code?: string;
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
}

export interface ApiError {
  error: string;
  code: string;
  message: string;
}
