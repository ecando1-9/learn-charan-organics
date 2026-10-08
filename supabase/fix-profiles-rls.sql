-- ============================================================
-- Supabase SQL: Auto-create lms_profiles on new user signup
-- and fix RLS policies for member list profile visibility
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Function that creates the profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lms_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email      = EXCLUDED.email,
      full_name  = COALESCE(EXCLUDED.full_name, lms_profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, lms_profiles.avatar_url);
  RETURN NEW;
END;
$$;

-- 2. Trigger: fires after every new user insert in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. Fix RLS policies on lms_profiles:
--    Allow ALL authenticated users to SELECT profiles
--    (required so members can see fellow student names/emails in community chats).
-- ============================================================

-- Allow authenticated users to view profiles (for community member lists)
DROP POLICY IF EXISTS "Users can view own profile" ON public.lms_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.lms_profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.lms_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.lms_profiles;
CREATE POLICY "Users can update own profile"
  ON public.lms_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything
DROP POLICY IF EXISTS "Service role full access" ON public.lms_profiles;
CREATE POLICY "Service role full access"
  ON public.lms_profiles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
