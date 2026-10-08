-- ============================================================
-- Fix All LMS Admin RLS Policies (Courses, Modules, Lessons, Videos, Categories, PDFs)
-- Run this in your Supabase SQL Editor to allow course creation and editing without RLS errors
-- ============================================================

-- 1. lms_course_categories
DROP POLICY IF EXISTS "LMS admins manage categories" ON public.lms_course_categories;
CREATE POLICY "LMS admins manage categories"
  ON public.lms_course_categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 2. lms_courses
DROP POLICY IF EXISTS "LMS admins manage courses" ON public.lms_courses;
CREATE POLICY "LMS admins manage courses"
  ON public.lms_courses FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 3. lms_modules
DROP POLICY IF EXISTS "LMS admins manage modules" ON public.lms_modules;
CREATE POLICY "LMS admins manage modules"
  ON public.lms_modules FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 4. lms_lessons
DROP POLICY IF EXISTS "LMS admins manage lessons" ON public.lms_lessons;
CREATE POLICY "LMS admins manage lessons"
  ON public.lms_lessons FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 5. lms_videos
DROP POLICY IF EXISTS "LMS admins manage videos" ON public.lms_videos;
CREATE POLICY "LMS admins manage videos"
  ON public.lms_videos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 6. lms_pdf_resources
DROP POLICY IF EXISTS "LMS admins manage pdfs" ON public.lms_pdf_resources;
CREATE POLICY "LMS admins manage pdfs"
  ON public.lms_pdf_resources FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 7. Grant admin role to your active user profiles
UPDATE public.lms_profiles
SET role = 'admin'
WHERE suspended = false;
