-- ============================================================
-- STIGMABOY Platform — Migration 001: Initial Schema
-- v1.1 — Fixed function/table ordering (is_admin, handle_new_user
--         now defined AFTER user_profiles table exists)
-- Run this in Supabase SQL Editor on a fresh database.
-- Then run 002_rls_policies.sql, then 003_seed_data.sql.
-- ============================================================

-- ============================================================
-- STEP 1: EXTENSIONS
-- No table dependencies — always first.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- trigram text search

-- ============================================================
-- STEP 2: set_updated_at()
-- Pure utility trigger function — no table dependency.
-- Defined first so every subsequent table trigger can use it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 3: user_profiles TABLE
-- Must exist before is_admin() and handle_new_user() reference it.
-- ============================================================

CREATE TABLE public.user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  instagram_url   TEXT,
  youtube_url     TEXT,
  phone           TEXT,
  role            TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin', 'creator')),
  is_active       BOOLEAN DEFAULT true,
  total_purchases INTEGER DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  xp_points       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 4: is_admin()
-- LANGUAGE sql functions are validated at definition time in
-- Postgres — the body is parsed and the referenced relation must
-- already exist. Defining this after user_profiles fixes the
-- "relation public.user_profiles does not exist" error.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================================
-- STEP 5: handle_new_user()
-- Inserts into user_profiles — must be after that table.
-- Bound to auth.users trigger below (after function exists).
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Bind to auth.users — function must exist before this line.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 6: COURSES
-- No dependency on user_profiles — can follow immediately.
-- ============================================================

CREATE TABLE public.courses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  subtitle       TEXT,
  description    TEXT,
  thumbnail_url  TEXT,
  preview_video  TEXT,
  price          NUMERIC(8,2) NOT NULL,
  original_price NUMERIC(8,2),
  is_published   BOOLEAN DEFAULT false,
  is_featured    BOOLEAN DEFAULT false,
  total_lessons  INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,   -- stored in minutes
  difficulty     TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  tags           TEXT[],
  total_students INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews  INTEGER DEFAULT 0,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 7: COURSE MODULES
-- FK → courses
-- ============================================================

CREATE TABLE public.course_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 8: COURSE LESSONS
-- FK → course_modules, courses
-- ============================================================

CREATE TABLE public.course_lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  duration    INTEGER,          -- in seconds
  is_preview  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function defined AFTER course_lessons exists
-- (references public.courses which already exists — safe)
CREATE OR REPLACE FUNCTION public.sync_course_lesson_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses
    SET total_lessons = total_lessons + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses
    SET total_lessons = GREATEST(total_lessons - 1, 0)
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_lesson_count
  AFTER INSERT OR DELETE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.sync_course_lesson_count();

-- ============================================================
-- STEP 9: COURSE PROGRESS
-- FK → auth.users, courses, course_lessons
-- ============================================================

CREATE TABLE public.course_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT false,
  watched_pct  INTEGER DEFAULT 0 CHECK (watched_pct BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- STEP 10: TEMPLATE CATEGORIES
-- No FK dependencies — standalone lookup table.
-- Must exist before templates references it.
-- ============================================================

CREATE TABLE public.template_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 11: TEMPLATES
-- FK → template_categories
-- ============================================================

CREATE TABLE public.templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  category_id    UUID REFERENCES public.template_categories(id),
  thumbnail_url  TEXT,
  preview_video  TEXT,
  file_path      TEXT NOT NULL,   -- private Supabase Storage path
  file_size      BIGINT,          -- bytes
  price          NUMERIC(8,2) NOT NULL,
  original_price NUMERIC(8,2),
  is_published   BOOLEAN DEFAULT false,
  is_featured    BOOLEAN DEFAULT false,
  is_free        BOOLEAN DEFAULT false,
  software       TEXT[],          -- e.g. ['Premiere Pro', 'After Effects']
  tags           TEXT[],
  total_sales    INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews  INTEGER DEFAULT 0,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 12: RESOURCE CATEGORIES
-- Standalone lookup table — must exist before resources.
-- ============================================================

CREATE TABLE public.resource_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 13: RESOURCES (free downloadable files)
-- FK → resource_categories
-- ============================================================

CREATE TABLE public.resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category_id     UUID REFERENCES public.resource_categories(id),
  thumbnail_url   TEXT,
  file_path       TEXT NOT NULL,
  file_size       BIGINT,
  is_published    BOOLEAN DEFAULT false,
  is_featured     BOOLEAN DEFAULT false,
  total_downloads INTEGER DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 14: RESOURCE DOWNLOADS
-- FK → resources, auth.users
-- ============================================================

CREATE TABLE public.resource_downloads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id   UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  user_id       UUID REFERENCES auth.users(id),
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function defined AFTER resource_downloads AND resources exist
CREATE OR REPLACE FUNCTION public.sync_resource_download_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.resources
  SET total_downloads = total_downloads + 1
  WHERE id = NEW.resource_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_download_count
  AFTER INSERT ON public.resource_downloads
  FOR EACH ROW EXECUTE FUNCTION public.sync_resource_download_count();

-- ============================================================
-- STEP 15: ORDERS
-- FK → auth.users
-- Must exist before order_items, user_purchases, coupon_usages.
-- ============================================================

CREATE TABLE public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  razorpay_order_id   TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','failed','refunded')),
  subtotal            NUMERIC(10,2) NOT NULL,
  discount_amount     NUMERIC(10,2) DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,
  coupon_id           UUID,           -- soft FK to coupons (avoids circular dependency)
  currency            TEXT DEFAULT 'INR',
  notes               JSONB,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 16: ORDER ITEMS
-- FK → orders
-- ============================================================

CREATE TABLE public.order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL CHECK (item_type IN ('course','template')),
  item_id    UUID NOT NULL,
  title      TEXT NOT NULL,
  price      NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 17: USER PURCHASES
-- FK → auth.users, orders
-- ============================================================

CREATE TABLE public.user_purchases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id     UUID NOT NULL REFERENCES public.orders(id),
  item_type    TEXT NOT NULL CHECK (item_type IN ('course','template')),
  item_id      UUID NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Trigger: update user xp + purchase count after each purchase
-- Defined after user_purchases AND user_profiles both exist
-- sync_user_purchase_stats: increments purchase count, XP, AND total_spent
-- total_spent is updated here by joining to the order total
CREATE OR REPLACE FUNCTION public.sync_user_purchase_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_total NUMERIC(10,2);
BEGIN
  -- Fetch the order total to update total_spent
  SELECT total INTO v_order_total
  FROM public.orders
  WHERE id = NEW.order_id;

  UPDATE public.user_profiles
  SET total_purchases = total_purchases + 1,
      xp_points       = xp_points + 50,
      total_spent     = total_spent + COALESCE(v_order_total, 0)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_purchase
  AFTER INSERT ON public.user_purchases
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_purchase_stats();

-- Trigger: increment total_students (course) or total_sales (template)
-- Defined after user_purchases, courses, templates all exist
CREATE OR REPLACE FUNCTION public.sync_item_sales_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.item_type = 'template' THEN
    UPDATE public.templates
    SET total_sales = total_sales + 1
    WHERE id = NEW.item_id;
  ELSIF NEW.item_type = 'course' THEN
    UPDATE public.courses
    SET total_students = total_students + 1
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_purchase_sync_item
  AFTER INSERT ON public.user_purchases
  FOR EACH ROW EXECUTE FUNCTION public.sync_item_sales_count();

-- ============================================================
-- STEP 18: COUPONS
-- No FK dependencies — standalone.
-- ============================================================

CREATE TABLE public.coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent','flat')),
  discount_value  NUMERIC(8,2) NOT NULL,
  max_uses        INTEGER,
  used_count      INTEGER DEFAULT 0,
  min_order_value NUMERIC(8,2) DEFAULT 0,
  valid_from      TIMESTAMPTZ DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 19: COUPON USAGES
-- FK → coupons, auth.users, orders
-- All three must exist before this table. orders is at step 15,
-- coupons at step 18, auth.users always exists. Safe here.
-- ============================================================

CREATE TABLE public.coupon_usages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id   UUID NOT NULL REFERENCES auth.users(id),
  order_id  UUID NOT NULL REFERENCES public.orders(id),
  used_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
  -- Design note: one coupon use per user (intentional)
);

-- ============================================================
-- STEP 20: REVIEWS
-- FK → auth.users
-- courses and templates must exist for the trigger to update them.
-- Both exist (steps 6 and 11). Safe here.
-- ============================================================

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  item_type   TEXT NOT NULL CHECK (item_type IN ('course','template')),
  item_id     UUID NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Trigger: sync average_rating + total_reviews on courses/templates
-- Defined after reviews, courses, templates all exist
CREATE OR REPLACE FUNCTION public.sync_item_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_id UUID;
  v_type    TEXT;
  v_avg     NUMERIC(3,2);
  v_count   INTEGER;
BEGIN
  v_item_id := COALESCE(NEW.item_id, OLD.item_id);
  v_type    := COALESCE(NEW.item_type, OLD.item_type);

  SELECT AVG(rating)::NUMERIC(3,2), COUNT(*)
  INTO v_avg, v_count
  FROM public.reviews
  WHERE item_id  = v_item_id
    AND item_type = v_type
    AND is_approved = true;

  IF v_type = 'course' THEN
    UPDATE public.courses
    SET average_rating = COALESCE(v_avg, 0),
        total_reviews  = COALESCE(v_count, 0)
    WHERE id = v_item_id;
  ELSIF v_type = 'template' THEN
    UPDATE public.templates
    SET average_rating = COALESCE(v_avg, 0),
        total_reviews  = COALESCE(v_count, 0)
    WHERE id = v_item_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER sync_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_item_rating();

-- ============================================================
-- STEP 21: EDIT REQUESTS
-- FK → auth.users (nullable — guests can submit)
-- ============================================================

CREATE TABLE public.edit_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  description    TEXT NOT NULL,
  budget_range   TEXT,
  reference_link TEXT,
  status         TEXT DEFAULT 'new'
                 CHECK (status IN ('new','reviewing','accepted','rejected','completed')),
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER edit_requests_updated_at
  BEFORE UPDATE ON public.edit_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STEP 22: EMAIL SUBSCRIBERS
-- FK → auth.users (nullable — guests can subscribe)
-- ============================================================

CREATE TABLE public.email_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  user_id       UUID REFERENCES auth.users(id),
  source        TEXT,           -- 'resource_download' | 'newsletter' | 'checkout'
  is_active     BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 23: ANNOUNCEMENTS
-- No FK dependencies.
-- ============================================================

CREATE TABLE public.announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT CHECK (type IN ('info','warning','promo','new')),
  is_active  BOOLEAN DEFAULT true,
  starts_at  TIMESTAMPTZ DEFAULT NOW(),
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 24: WISHLIST ITEMS
-- FK → auth.users
-- ============================================================

CREATE TABLE public.wishlist_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('course','template')),
  item_id   UUID NOT NULL,
  added_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- STEP 25: AUDIT LOGS
-- FK → auth.users (nullable — some actions may be system-level)
-- Must be last — audit log is the sink for everything.
-- ============================================================

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 26: INDEXES
-- All tables must exist before indexes reference them.
-- ============================================================

-- user_profiles
CREATE INDEX idx_user_profiles_role     ON public.user_profiles(role);

-- courses
CREATE INDEX idx_courses_published      ON public.courses(is_published, sort_order);
CREATE INDEX idx_courses_featured       ON public.courses(is_featured) WHERE is_featured = true;
CREATE INDEX idx_courses_slug           ON public.courses(slug);
CREATE INDEX idx_courses_search         ON public.courses
  USING gin(to_tsvector('english', title || ' ' || COALESCE(subtitle, '')));

-- course modules + lessons
CREATE INDEX idx_course_modules_course  ON public.course_modules(course_id, sort_order);
CREATE INDEX idx_course_lessons_module  ON public.course_lessons(module_id, sort_order);
CREATE INDEX idx_course_lessons_course  ON public.course_lessons(course_id);

-- course progress
CREATE INDEX idx_course_progress_user   ON public.course_progress(user_id, course_id);
CREATE INDEX idx_course_progress_lesson ON public.course_progress(lesson_id);

-- templates
CREATE INDEX idx_templates_category     ON public.templates(category_id, is_published);
CREATE INDEX idx_templates_featured     ON public.templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_slug         ON public.templates(slug);
CREATE INDEX idx_templates_search       ON public.templates
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- resources
CREATE INDEX idx_resources_published    ON public.resources(is_published, sort_order);
CREATE INDEX idx_resources_category     ON public.resources(category_id);

-- resource downloads
CREATE INDEX idx_resource_downloads_res ON public.resource_downloads(resource_id);
CREATE INDEX idx_resource_downloads_email ON public.resource_downloads(email);

-- orders
CREATE INDEX idx_orders_user            ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status          ON public.orders(status);
CREATE INDEX idx_orders_razorpay        ON public.orders(razorpay_order_id);

-- order items
CREATE INDEX idx_order_items_order      ON public.order_items(order_id);

-- user purchases
CREATE INDEX idx_user_purchases_user    ON public.user_purchases(user_id, item_type);
CREATE INDEX idx_user_purchases_item    ON public.user_purchases(item_id, item_type);

-- coupons
CREATE INDEX idx_coupons_code           ON public.coupons(code) WHERE is_active = true;

-- reviews
CREATE INDEX idx_reviews_item           ON public.reviews(item_id, item_type, is_approved);

-- edit requests
CREATE INDEX idx_edit_requests_status   ON public.edit_requests(status, created_at DESC);

-- email subscribers
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);

-- audit logs
CREATE INDEX idx_audit_logs_user        ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity      ON public.audit_logs(entity_type, entity_id);

-- ============================================================
-- DONE — Run 002_rls_policies.sql next
-- ============================================================
