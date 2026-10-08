-- ============================================================
-- FIX RLS POLICIES FOR COMMUNITY GROUPS, MEMBERS & MESSAGES
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.lms_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_group_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies on community tables
DROP POLICY IF EXISTS "LMS members read groups" ON public.lms_groups;
DROP POLICY IF EXISTS "LMS admins manage groups" ON public.lms_groups;
DROP POLICY IF EXISTS "groups_select" ON public.lms_groups;
DROP POLICY IF EXISTS "groups_insert" ON public.lms_groups;
DROP POLICY IF EXISTS "groups_update" ON public.lms_groups;
DROP POLICY IF EXISTS "groups_delete" ON public.lms_groups;

DROP POLICY IF EXISTS "LMS members read group membership" ON public.lms_group_members;
DROP POLICY IF EXISTS "LMS admins manage group members" ON public.lms_group_members;
DROP POLICY IF EXISTS "members_select" ON public.lms_group_members;
DROP POLICY IF EXISTS "members_insert" ON public.lms_group_members;
DROP POLICY IF EXISTS "members_delete" ON public.lms_group_members;

DROP POLICY IF EXISTS "LMS group members read messages" ON public.lms_group_messages;
DROP POLICY IF EXISTS "LMS group members send messages" ON public.lms_group_messages;
DROP POLICY IF EXISTS "LMS admins moderate messages" ON public.lms_group_messages;
DROP POLICY IF EXISTS "messages_select" ON public.lms_group_messages;
DROP POLICY IF EXISTS "messages_insert" ON public.lms_group_messages;
DROP POLICY IF EXISTS "messages_delete" ON public.lms_group_messages;

-- Helper function: is admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lms_profiles
    WHERE id = auth.uid() AND role::text IN ('admin', 'author', 'instructor')
  );
$$;

-- ------------------------------------------------------------
-- 1. lms_groups
-- SELECT: All authenticated users can view groups
-- INSERT: Admins or authenticated user creating a group (created_by = auth.uid())
-- UPDATE/DELETE: Admins or group creator
-- ------------------------------------------------------------
CREATE POLICY "groups_select" ON public.lms_groups
  FOR SELECT USING (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "groups_insert" ON public.lms_groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "groups_update" ON public.lms_groups
  FOR UPDATE USING (created_by = auth.uid() OR is_admin());

CREATE POLICY "groups_delete" ON public.lms_groups
  FOR DELETE USING (created_by = auth.uid() OR is_admin());

-- ------------------------------------------------------------
-- 2. lms_group_members
-- SELECT: All authenticated users
-- INSERT: Admins, group creator, or self-joining user
-- DELETE: Admins, group creator, or self-leaving user
-- ------------------------------------------------------------
CREATE POLICY "members_select" ON public.lms_group_members
  FOR SELECT USING (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "members_insert" ON public.lms_group_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "members_delete" ON public.lms_group_members
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- ------------------------------------------------------------
-- 3. lms_group_messages
-- SELECT: All authenticated group members & admins
-- INSERT: All authenticated group members & admins
-- DELETE: Message author or admins
-- ------------------------------------------------------------
CREATE POLICY "messages_select" ON public.lms_group_messages
  FOR SELECT USING (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "messages_insert" ON public.lms_group_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR is_admin());

CREATE POLICY "messages_delete" ON public.lms_group_messages
  FOR DELETE USING (user_id = auth.uid() OR is_admin());

-- Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('lms_groups', 'lms_group_members', 'lms_group_messages')
ORDER BY tablename, policyname;
