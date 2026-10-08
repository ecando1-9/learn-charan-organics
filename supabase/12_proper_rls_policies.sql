-- ============================================================
-- SECURITY: Proper RLS policies for all LMS tables
-- SAFE VERSION — tested for side effects
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Enable RLS on all tables
ALTER TABLE lms_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_videos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_enrollments     ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing lms_ policies (clean slate, no conflicts)
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

-- Step 3: Helper function — checks if current user is admin
-- SECURITY DEFINER means it reads lms_profiles bypassing RLS (no infinite loop)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM lms_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- lms_profiles
-- WHO CAN READ: user reads own profile; admin reads all
-- WHO CAN WRITE: user updates own profile (but NOT role); admin can do anything
-- SIDE EFFECTS: None. New user trigger is SECURITY DEFINER so it bypasses RLS ✓
-- ============================================================
CREATE POLICY "profiles_select" ON lms_profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

-- Users can update their own name/avatar etc but CANNOT change their own role
-- Admins can update anyone (including changing roles)
CREATE POLICY "profiles_update" ON lms_profiles
  FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (
    is_admin()
    OR (id = auth.uid() AND role = (SELECT role FROM lms_profiles p WHERE p.id = auth.uid()))
  );

-- Only admins insert/delete (new user trigger bypasses this via SECURITY DEFINER)
CREATE POLICY "profiles_insert" ON lms_profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "profiles_delete" ON lms_profiles
  FOR DELETE USING (is_admin());

-- ============================================================
-- lms_courses
-- WHO CAN READ: published courses visible to everyone (including not logged in)
-- WHO CAN WRITE: admins only
-- SIDE EFFECTS: None. getPublishedCourses() uses .eq("published", true) ✓
-- ============================================================
CREATE POLICY "courses_select" ON lms_courses
  FOR SELECT USING (published = true OR is_admin());

CREATE POLICY "courses_write" ON lms_courses
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- lms_course_categories
-- WHO CAN READ: everyone (needed for public course listing page)
-- WHO CAN WRITE: admins only
-- SIDE EFFECTS: None. getCategoryMap() reads this for public pages ✓
-- ============================================================
CREATE POLICY "categories_select" ON lms_course_categories
  FOR SELECT USING (true);

CREATE POLICY "categories_write" ON lms_course_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- lms_modules
-- WHO CAN READ: modules of published courses (for course detail page)
-- WHO CAN WRITE: admins only
-- SIDE EFFECTS: None. getCourseBySlug() reads modules for public ✓
-- ============================================================
CREATE POLICY "modules_select" ON lms_modules
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM lms_courses c
      WHERE c.id = lms_modules.course_id AND c.published = true
    )
  );

CREATE POLICY "modules_write" ON lms_modules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- lms_lessons
-- WHO CAN READ:
--   - preview=true lessons: everyone (free preview)
--   - locked lessons: only enrolled students + admins
-- WHO CAN WRITE: admins only
-- SIDE EFFECTS: Course detail page shows lesson titles even for unenrolled
--   users (because preview=true on all lessons by default — check your data)
-- ============================================================
CREATE POLICY "lessons_select" ON lms_lessons
  FOR SELECT USING (
    is_admin()
    OR is_preview = true
    OR EXISTS (
      SELECT 1 FROM lms_enrollments e
      JOIN lms_modules m ON m.id = lms_lessons.module_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = m.course_id
        AND e.status = 'active'
    )
  );

CREATE POLICY "lessons_write" ON lms_lessons
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- lms_videos  ← MOST IMPORTANT: paid content protection
-- WHO CAN READ: only enrolled students + admins
-- WHO CAN WRITE: admins only
-- SIDE EFFECTS: None. /api/video/stream already validates enrollment
--   before querying this table. RLS is a second layer of protection ✓
-- ============================================================
CREATE POLICY "videos_select" ON lms_videos
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM lms_enrollments e
      JOIN lms_lessons l ON l.id = lms_videos.lesson_id
      JOIN lms_modules m ON m.id = l.module_id
      WHERE e.user_id = auth.uid()
        AND e.course_id = m.course_id
        AND e.status = 'active'
    )
  );

CREATE POLICY "videos_write" ON lms_videos
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- lms_enrollments
-- WHO CAN READ: student sees own; admin sees all
-- WHO CAN WRITE: admins only (payment webhook uses service role = bypasses RLS)
-- SIDE EFFECTS: None ✓
-- ============================================================
CREATE POLICY "enrollments_select" ON lms_enrollments
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "enrollments_write" ON lms_enrollments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- Verify: list all policies created
-- ============================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename LIKE 'lms_%'
ORDER BY tablename, policyname;
