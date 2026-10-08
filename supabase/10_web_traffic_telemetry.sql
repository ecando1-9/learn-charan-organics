-- ============================================================
-- Vercel-Style Web Traffic & Visitor Telemetry Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lms_web_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid REFERENCES public.lms_profiles(id) ON DELETE SET NULL,
  path text NOT NULL,
  referrer text,
  country_code text DEFAULT 'IN',
  country_name text DEFAULT 'India',
  device_type text DEFAULT 'desktop',
  browser text DEFAULT 'Chrome',
  session_duration_seconds integer DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lms_web_telemetry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert web telemetry" ON public.lms_web_telemetry;
CREATE POLICY "Public insert web telemetry"
  ON public.lms_web_telemetry FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read web telemetry" ON public.lms_web_telemetry;
CREATE POLICY "Admins read web telemetry"
  ON public.lms_web_telemetry FOR SELECT
  TO authenticated
  USING (true);
