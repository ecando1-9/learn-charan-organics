-- ============================================================
-- 19. PERMANENT STUDENT REVIEWS & TESTIMONIALS TABLE
-- Run in Supabase Dashboard → SQL Editor
-- Stores all user submitted reviews permanently in Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lms_student_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.lms_profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text DEFAULT 'Student Maker',
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  quote text NOT NULL,
  avatar text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lms_student_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read published student reviews
DROP POLICY IF EXISTS "student_reviews_select" ON public.lms_student_reviews;
CREATE POLICY "student_reviews_select" ON public.lms_student_reviews
  FOR SELECT USING (published = true OR public.is_admin());

-- Anyone can submit a review
DROP POLICY IF EXISTS "student_reviews_insert" ON public.lms_student_reviews;
CREATE POLICY "student_reviews_insert" ON public.lms_student_reviews
  FOR INSERT WITH CHECK (true);

-- Admins can update/delete reviews
DROP POLICY IF EXISTS "student_reviews_admin" ON public.lms_student_reviews;
CREATE POLICY "student_reviews_admin" ON public.lms_student_reviews
  FOR ALL USING (public.is_admin());
