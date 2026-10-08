-- ============================================================
-- ALL-IN-ONE COMPLETE RLS & SECURITY POLICIES FOR CHARAN ORGANICS LMS
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Enable RLS on all LMS tables
ALTER TABLE IF EXISTS public.lms_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_course_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_modules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_videos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_video_watch_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_web_telemetry      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lms_group_messages    ENABLE ROW LEVEL SECURITY;

-- Step 2: Clean slate — drop all existing policies on lms_% tables
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename LIKE 'lms_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Step 3: Admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Ensure all existing courses are published = true by default
UPDATE public.lms_courses SET published = true WHERE published IS NULL;

-- ------------------------------------------------------------
-- 1. lms_courses (Course catalog — readable by all so /courses & /learn pages work)
-- ------------------------------------------------------------
CREATE POLICY "courses_select" ON public.lms_courses
  FOR SELECT USING (true);

CREATE POLICY "courses_write" ON public.lms_courses
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 2. lms_course_categories (Categories list — readable by all)
-- ------------------------------------------------------------
CREATE POLICY "categories_select" ON public.lms_course_categories
  FOR SELECT USING (true);

CREATE POLICY "categories_write" ON public.lms_course_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 3. lms_modules (Module list — readable by all)
-- ------------------------------------------------------------
CREATE POLICY "modules_select" ON public.lms_modules
  FOR SELECT USING (true);

CREATE POLICY "modules_write" ON public.lms_modules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 4. lms_lessons (Lesson list & titles — readable by all)
-- ------------------------------------------------------------
CREATE POLICY "lessons_select" ON public.lms_lessons
  FOR SELECT USING (true);

CREATE POLICY "lessons_write" ON public.lms_lessons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 5. lms_videos (STRICT ACCESS — Paid video credentials only for enrolled users & admins)
-- ------------------------------------------------------------
CREATE POLICY "videos_select" ON public.lms_videos
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM public.lms_enrollments e
      JOIN public.lms_lessons l ON l.id = public.lms_videos.lesson_id
      JOIN public.lms_modules m ON m.id = l.module_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = m.course_id
        AND e.status = 'active'
    )
  );

CREATE POLICY "videos_write" ON public.lms_videos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 6. lms_profiles (Users see own profile; admins see all)
-- ------------------------------------------------------------
CREATE POLICY "profiles_select" ON public.lms_profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update" ON public.lms_profiles
  FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (
    is_admin()
    OR (id = auth.uid() AND role = (SELECT role FROM public.lms_profiles p WHERE p.id = auth.uid()))
  );

CREATE POLICY "profiles_insert" ON public.lms_profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "profiles_delete" ON public.lms_profiles
  FOR DELETE USING (is_admin());

-- ------------------------------------------------------------
-- 7. lms_enrollments (Students see own enrollments; admins see all)
-- ------------------------------------------------------------
CREATE POLICY "enrollments_select" ON public.lms_enrollments
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "enrollments_write" ON public.lms_enrollments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 8. lms_web_telemetry (Pageview traffic analytics)
-- ------------------------------------------------------------
CREATE POLICY "telemetry_insert" ON public.lms_web_telemetry
  FOR INSERT WITH CHECK (true);

CREATE POLICY "telemetry_select" ON public.lms_web_telemetry
  FOR SELECT USING (is_admin());

-- ------------------------------------------------------------
-- 9. lms_video_watch_logs (Video watch telemetry)
-- ------------------------------------------------------------
CREATE POLICY "watch_logs_insert" ON public.lms_video_watch_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "watch_logs_select" ON public.lms_video_watch_logs
  FOR SELECT USING (is_admin());

-- ------------------------------------------------------------
-- 10. lms_audit_logs (System audit logs)
-- ------------------------------------------------------------
CREATE POLICY "audit_logs_insert" ON public.lms_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_select" ON public.lms_audit_logs
  FOR SELECT USING (is_admin());

-- ------------------------------------------------------------
-- 11. lms_progress (Student video progress)
-- ------------------------------------------------------------
CREATE POLICY "progress_select" ON public.lms_progress
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "progress_insert" ON public.lms_progress
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "progress_update" ON public.lms_progress
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------
-- 12. lms_group_messages (Community discussion)
-- ------------------------------------------------------------
CREATE POLICY "messages_select" ON public.lms_group_messages
  FOR SELECT USING (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "messages_insert" ON public.lms_group_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "messages_delete" ON public.lms_group_messages
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Verify all policies created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename LIKE 'lms_%' 
ORDER BY tablename, policyname;
