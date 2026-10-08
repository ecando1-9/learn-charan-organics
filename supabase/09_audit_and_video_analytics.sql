-- ============================================================
-- Enterprise Audit Logs & Video Watch Analytics
-- ============================================================

-- 1. System Audit Logs Table (Tracks edits, actions, clicks, logins, creations)
CREATE TABLE IF NOT EXISTS public.lms_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.lms_profiles(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Video Watch Analytics Table (Tracks Bunny vs YouTube watch time, hours, peak times, viewer roster)
CREATE TABLE IF NOT EXISTS public.lms_video_watch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.lms_profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  video_type text NOT NULL DEFAULT 'bunny', -- 'bunny' or 'youtube'
  watch_duration_seconds integer NOT NULL DEFAULT 0,
  watch_date date NOT NULL DEFAULT CURRENT_DATE,
  watch_hour integer NOT NULL DEFAULT EXTRACT(HOUR FROM now()),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lms_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_video_watch_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lms_audit_logs
DROP POLICY IF EXISTS "Authenticated users insert audit logs" ON public.lms_audit_logs;
CREATE POLICY "Authenticated users insert audit logs"
  ON public.lms_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read audit logs" ON public.lms_audit_logs;
CREATE POLICY "Admins read audit logs"
  ON public.lms_audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for lms_video_watch_logs
DROP POLICY IF EXISTS "Authenticated users insert watch logs" ON public.lms_video_watch_logs;
CREATE POLICY "Authenticated users insert watch logs"
  ON public.lms_video_watch_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read watch logs" ON public.lms_video_watch_logs;
CREATE POLICY "Admins read watch logs"
  ON public.lms_video_watch_logs FOR SELECT
  TO authenticated
  USING (true);
