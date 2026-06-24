-- ============================================================
-- STIGMABOY Platform — Migration 002: RLS Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_downloads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER PROFILES
-- ============================================================

-- Users can read and update their own profile
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid())
    -- Prevents users from promoting themselves to admin
  );

-- Admin can do everything using cached is_admin() function
CREATE POLICY "user_profiles_admin_all"
  ON public.user_profiles FOR ALL
  USING (public.is_admin());

-- ============================================================
-- COURSES
-- ============================================================

-- Anyone can read published courses
CREATE POLICY "courses_select_published"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- Admins manage all courses
CREATE POLICY "courses_admin_all"
  ON public.courses FOR ALL
  USING (public.is_admin());

-- ============================================================
-- COURSE MODULES & LESSONS
-- ============================================================

-- Anyone can read modules/lessons of published courses
CREATE POLICY "course_modules_select"
  ON public.course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND is_published = true
    )
  );

CREATE POLICY "course_modules_admin_all"
  ON public.course_modules FOR ALL
  USING (public.is_admin());

CREATE POLICY "course_lessons_select"
  ON public.course_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND is_published = true
    )
  );

CREATE POLICY "course_lessons_admin_all"
  ON public.course_lessons FOR ALL
  USING (public.is_admin());

-- ============================================================
-- COURSE PROGRESS
-- ============================================================

-- Users can only access their own progress
CREATE POLICY "course_progress_own"
  ON public.course_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "course_progress_admin_all"
  ON public.course_progress FOR ALL
  USING (public.is_admin());

-- ============================================================
-- TEMPLATE CATEGORIES (public read)
-- ============================================================

CREATE POLICY "template_categories_select_all"
  ON public.template_categories FOR SELECT
  USING (true);

CREATE POLICY "template_categories_admin_all"
  ON public.template_categories FOR ALL
  USING (public.is_admin());

-- ============================================================
-- TEMPLATES
-- ============================================================

-- Anyone can read published templates (NOT file_path — handled server-side)
CREATE POLICY "templates_select_published"
  ON public.templates FOR SELECT
  USING (is_published = true);

CREATE POLICY "templates_admin_all"
  ON public.templates FOR ALL
  USING (public.is_admin());

-- ============================================================
-- RESOURCE CATEGORIES & RESOURCES (public read)
-- ============================================================

CREATE POLICY "resource_categories_select_all"
  ON public.resource_categories FOR SELECT
  USING (true);

CREATE POLICY "resource_categories_admin_all"
  ON public.resource_categories FOR ALL
  USING (public.is_admin());

CREATE POLICY "resources_select_published"
  ON public.resources FOR SELECT
  USING (is_published = true);

CREATE POLICY "resources_admin_all"
  ON public.resources FOR ALL
  USING (public.is_admin());

-- Anyone can insert resource_downloads (email gate)
CREATE POLICY "resource_downloads_insert_all"
  ON public.resource_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "resource_downloads_select_own"
  ON public.resource_downloads FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "resource_downloads_admin_all"
  ON public.resource_downloads FOR ALL
  USING (public.is_admin());

-- ============================================================
-- ORDERS
-- ============================================================

-- Users can only see their own orders
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Server-side inserts handled via service role — no user insert needed

CREATE POLICY "orders_admin_all"
  ON public.orders FOR ALL
  USING (public.is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_admin_all"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- ============================================================
-- USER PURCHASES
-- ============================================================

CREATE POLICY "user_purchases_select_own"
  ON public.user_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_purchases_admin_all"
  ON public.user_purchases FOR ALL
  USING (public.is_admin());

-- ============================================================
-- COUPONS
-- ============================================================

-- Users can only read active coupons via the validate API (no direct table read)
-- Admins manage coupons
CREATE POLICY "coupons_admin_all"
  ON public.coupons FOR ALL
  USING (public.is_admin());

CREATE POLICY "coupon_usages_select_own"
  ON public.coupon_usages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coupon_usages_admin_all"
  ON public.coupon_usages FOR ALL
  USING (public.is_admin());

-- ============================================================
-- REVIEWS
-- ============================================================

-- Anyone can read approved reviews
CREATE POLICY "reviews_select_approved"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- Logged-in users can insert their own reviews
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_admin_all"
  ON public.reviews FOR ALL
  USING (public.is_admin());

-- ============================================================
-- EDIT REQUESTS
-- ============================================================

-- Anyone can submit an edit request
CREATE POLICY "edit_requests_insert_all"
  ON public.edit_requests FOR INSERT
  WITH CHECK (true);

-- Users can see their own edit requests
CREATE POLICY "edit_requests_select_own"
  ON public.edit_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "edit_requests_admin_all"
  ON public.edit_requests FOR ALL
  USING (public.is_admin());

-- ============================================================
-- EMAIL SUBSCRIBERS
-- ============================================================

-- Anyone can subscribe (insert)
CREATE POLICY "email_subscribers_insert_all"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);

-- Users can see their own subscription
CREATE POLICY "email_subscribers_select_own"
  ON public.email_subscribers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "email_subscribers_admin_all"
  ON public.email_subscribers FOR ALL
  USING (public.is_admin());

-- ============================================================
-- ANNOUNCEMENTS (public read)
-- ============================================================

CREATE POLICY "announcements_select_active"
  ON public.announcements FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

CREATE POLICY "announcements_admin_all"
  ON public.announcements FOR ALL
  USING (public.is_admin());

-- ============================================================
-- WISHLIST
-- ============================================================

CREATE POLICY "wishlist_items_own"
  ON public.wishlist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wishlist_items_admin_all"
  ON public.wishlist_items FOR ALL
  USING (public.is_admin());

-- ============================================================
-- AUDIT LOGS
-- ============================================================

-- Only admins can read audit logs
CREATE POLICY "audit_logs_admin_all"
  ON public.audit_logs FOR ALL
  USING (public.is_admin());

-- Server-side only inserts (via service role) — no user policy needed

-- ============================================================
-- DONE
-- ============================================================
-- Run 003_seed_data.sql next
