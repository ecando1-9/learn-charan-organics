-- Community & Bunny Stream Migration
-- Safely adds author role, bunny video columns, free classes, and community tables.

-- Add 'author' value to role enum (safe, skips if exists)
DO $$ BEGIN
  ALTER TYPE public.lms_user_role ADD VALUE IF NOT EXISTS 'author';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add Bunny Stream columns to lms_videos
ALTER TABLE public.lms_videos
  ADD COLUMN IF NOT EXISTS bunny_video_id text,
  ADD COLUMN IF NOT EXISTS bunny_library_id text;

-- Free Classes table (admin-managed YouTube videos shown publicly)
CREATE TABLE IF NOT EXISTS public.lms_free_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  youtube_video_id text NOT NULL,
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.lms_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Community Groups
CREATE TABLE IF NOT EXISTS public.lms_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image_url text,
  created_by uuid REFERENCES public.lms_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Group Members
CREATE TABLE IF NOT EXISTS public.lms_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.lms_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.lms_profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Group Messages
CREATE TABLE IF NOT EXISTS public.lms_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.lms_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.lms_profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  resource_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lms_free_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_group_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is admin or author
CREATE OR REPLACE FUNCTION public.lms_is_author()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.lms_profiles
    WHERE id = auth.uid()
      AND role::text IN ('admin', 'author', 'instructor')
      AND suspended = false
  );
$$;

-- Policies: lms_free_classes
DROP POLICY IF EXISTS "LMS public read free classes" ON public.lms_free_classes;
CREATE POLICY "LMS public read free classes"
  ON public.lms_free_classes FOR SELECT
  USING (published = true OR public.lms_is_admin());

DROP POLICY IF EXISTS "LMS admins manage free classes" ON public.lms_free_classes;
CREATE POLICY "LMS admins manage free classes"
  ON public.lms_free_classes FOR ALL
  USING (public.lms_is_admin())
  WITH CHECK (public.lms_is_admin());

-- Policies: lms_groups
DROP POLICY IF EXISTS "LMS members read groups" ON public.lms_groups;
CREATE POLICY "LMS members read groups"
  ON public.lms_groups FOR SELECT
  USING (
    public.lms_is_admin()
    OR EXISTS (
      SELECT 1 FROM public.lms_group_members gm
      WHERE gm.group_id = lms_groups.id AND gm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "LMS admins manage groups" ON public.lms_groups;
CREATE POLICY "LMS admins manage groups"
  ON public.lms_groups FOR ALL
  USING (public.lms_is_admin())
  WITH CHECK (public.lms_is_admin());

-- Policies: lms_group_members
DROP POLICY IF EXISTS "LMS members read group membership" ON public.lms_group_members;
CREATE POLICY "LMS members read group membership"
  ON public.lms_group_members FOR SELECT
  USING (user_id = auth.uid() OR public.lms_is_admin());

DROP POLICY IF EXISTS "LMS admins manage group members" ON public.lms_group_members;
CREATE POLICY "LMS admins manage group members"
  ON public.lms_group_members FOR ALL
  USING (public.lms_is_admin())
  WITH CHECK (public.lms_is_admin());

-- Policies: lms_group_messages
DROP POLICY IF EXISTS "LMS group members read messages" ON public.lms_group_messages;
CREATE POLICY "LMS group members read messages"
  ON public.lms_group_messages FOR SELECT
  USING (
    public.lms_is_admin()
    OR EXISTS (
      SELECT 1 FROM public.lms_group_members gm
      WHERE gm.group_id = lms_group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "LMS group members send messages" ON public.lms_group_messages;
CREATE POLICY "LMS group members send messages"
  ON public.lms_group_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.lms_group_members gm
      WHERE gm.group_id = lms_group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "LMS admins moderate messages" ON public.lms_group_messages;
CREATE POLICY "LMS admins moderate messages"
  ON public.lms_group_messages FOR ALL
  USING (public.lms_is_admin())
  WITH CHECK (public.lms_is_admin());
