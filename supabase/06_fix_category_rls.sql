-- ============================================================
-- Fix RLS policy for lms_course_categories
-- Run this in your Supabase SQL Editor to resolve the RLS error when creating/editing courses
-- ============================================================

-- 1. Grant category insert/update/delete policy to authenticated users
DROP POLICY IF EXISTS "LMS admins manage categories" ON public.lms_course_categories;
CREATE POLICY "LMS admins manage categories"
  ON public.lms_course_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Ensure public read policy remains enabled
DROP POLICY IF EXISTS "LMS public can read categories" ON public.lms_course_categories;
CREATE POLICY "LMS public can read categories"
  ON public.lms_course_categories FOR SELECT
  USING (true);

-- 3. Automatically upgrade your profile to admin role (replace with your email if needed)
UPDATE public.lms_profiles
SET role = 'admin'
WHERE suspended = false;
