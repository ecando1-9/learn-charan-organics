-- ============================================================
-- SECURITY: Restore RLS Policies for Telemetry, Watch Logs, Audit Logs, Progress & Community
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. lms_video_watch_logs
ALTER TABLE public.lms_video_watch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "watch_logs_insert" ON public.lms_video_watch_logs;
CREATE POLICY "watch_logs_insert" ON public.lms_video_watch_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "watch_logs_select" ON public.lms_video_watch_logs;
CREATE POLICY "watch_logs_select" ON public.lms_video_watch_logs
  FOR SELECT USING (is_admin());

-- 2. lms_audit_logs
ALTER TABLE public.lms_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_insert" ON public.lms_audit_logs;
CREATE POLICY "audit_logs_insert" ON public.lms_audit_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_select" ON public.lms_audit_logs;
CREATE POLICY "audit_logs_select" ON public.lms_audit_logs
  FOR SELECT USING (is_admin());

-- 3. lms_web_telemetry
ALTER TABLE public.lms_web_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "telemetry_insert" ON public.lms_web_telemetry;
CREATE POLICY "telemetry_insert" ON public.lms_web_telemetry
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "telemetry_select" ON public.lms_web_telemetry;
CREATE POLICY "telemetry_select" ON public.lms_web_telemetry
  FOR SELECT USING (is_admin());

-- 4. lms_progress (if table exists)
CREATE TABLE IF NOT EXISTS public.lms_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.lms_profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  video_watched_percent integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lms_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progress_select" ON public.lms_progress;
CREATE POLICY "progress_select" ON public.lms_progress
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "progress_insert" ON public.lms_progress;
CREATE POLICY "progress_insert" ON public.lms_progress
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "progress_update" ON public.lms_progress;
CREATE POLICY "progress_update" ON public.lms_progress
  FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- 5. lms_group_messages (if table exists)
CREATE TABLE IF NOT EXISTS public.lms_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.lms_profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lms_group_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON public.lms_group_messages;
CREATE POLICY "messages_select" ON public.lms_group_messages
  FOR SELECT USING (auth.role() = 'authenticated' OR is_admin());

DROP POLICY IF EXISTS "messages_insert" ON public.lms_group_messages;
CREATE POLICY "messages_insert" ON public.lms_group_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "messages_delete" ON public.lms_group_messages;
CREATE POLICY "messages_delete" ON public.lms_group_messages
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Verify all policies across all LMS tables
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename LIKE 'lms_%' 
ORDER BY tablename, policyname;
