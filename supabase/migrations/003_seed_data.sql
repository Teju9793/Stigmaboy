-- ============================================================
-- STIGMABOY Platform — Migration 003: Seed Data
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- TEMPLATE CATEGORIES
-- ============================================================

INSERT INTO public.template_categories (name, slug, description, sort_order) VALUES
  ('Premiere Pro',      'premiere-pro',  'Video editing templates for Adobe Premiere Pro',     1),
  ('After Effects',     'after-effects', 'Motion graphics and VFX for Adobe After Effects',    2),
  ('LUTs & Presets',    'luts-presets',  'Color grading LUTs and Lightroom / Premiere presets', 3),
  ('Thumbnails',        'thumbnails',    'YouTube and social media thumbnail templates',         4),
  ('Motion Graphics',   'motion',        'Animated elements, lower thirds, intros and outros',  5),
  ('Sound Effects',     'sfx',           'Cinematic and viral audio effects',                    6);

-- ============================================================
-- RESOURCE CATEGORIES
-- ============================================================

INSERT INTO public.resource_categories (name, slug) VALUES
  ('Free LUTs',          'free-luts'),
  ('Presets',            'presets'),
  ('Stock Footage',      'stock-footage'),
  ('Cheat Sheets',       'cheat-sheets'),
  ('Brushes & Assets',   'assets');

-- ============================================================
-- PROMOTE ADMIN USER
-- (Replace the email below with your actual admin email)
-- Run this AFTER you have created your first account via the app
-- ============================================================

-- UPDATE public.user_profiles
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'admin@stigmaboy.com' LIMIT 1
-- );

-- ============================================================
-- SAMPLE ANNOUNCEMENT (optional — for testing)
-- ============================================================

INSERT INTO public.announcements (title, body, type, is_active, starts_at) VALUES
  (
    '🎉 STIGMABOY Platform is LIVE!',
    'Browse our premium editing courses and templates.',
    'new',
    true,
    NOW()
  );

-- ============================================================
-- DONE — Schema is ready
-- ============================================================
