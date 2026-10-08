-- ============================================================
-- DEFAULT WELCOME GROUP & ADMIN-ONLY ANNOUNCEMENT MODE
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add admin_only_messaging column to lms_groups
ALTER TABLE public.lms_groups
  ADD COLUMN IF NOT EXISTS admin_only_messaging boolean NOT NULL DEFAULT false;

-- 2. Create Default Welcome Group if it doesn't exist
INSERT INTO public.lms_groups (id, name, description, admin_only_messaging)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Welcome to Charan Organics Academy 🌿',
  'Official announcement group for all students. Stay updated with new course releases, formulation news, and academy tips!',
  true -- Default to Announcement Mode (Only Admins message)
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Auto-add all existing users to the Welcome Group
INSERT INTO public.lms_group_members (group_id, user_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM public.lms_profiles
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 4. Create trigger to automatically add NEW signups to Welcome Group
CREATE OR REPLACE FUNCTION public.on_signup_join_welcome_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lms_group_members (group_id, user_id)
  VALUES ('00000000-0000-0000-0000-000000000001', NEW.id)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_join_welcome_group ON public.lms_profiles;
CREATE TRIGGER tr_auto_join_welcome_group
  AFTER INSERT ON public.lms_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_signup_join_welcome_group();
