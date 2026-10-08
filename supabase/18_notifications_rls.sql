-- ============================================================
-- 18. NOTIFICATIONS RLS & POLICIES
-- Run in Supabase Dashboard → SQL Editor
-- Enables full notification features for users & admins
-- ============================================================

ALTER TABLE IF EXISTS public.lms_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON public.lms_notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.lms_notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.lms_notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.lms_notifications;

-- Users can read their own notifications, admins can read all
CREATE POLICY "notifications_select" ON public.lms_notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Admins can insert notifications for any user
CREATE POLICY "notifications_insert" ON public.lms_notifications
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Users can update (e.g. mark as read) their own notifications
CREATE POLICY "notifications_update" ON public.lms_notifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Admins or owners can delete notifications
CREATE POLICY "notifications_delete" ON public.lms_notifications
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());
