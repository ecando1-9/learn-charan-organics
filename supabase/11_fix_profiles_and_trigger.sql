-- ============================================================
-- Run in Supabase Dashboard → SQL Editor
-- ONLY sets YOUR account as admin. Everyone else = student.
-- ============================================================

-- Step 1: Set YOUR account to admin.
-- ⚠ Replace 'YOUR_EMAIL@example.com' with your actual login email.
UPDATE lms_profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL@example.com';

-- If the row doesn't exist yet, insert it:
INSERT INTO lms_profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email,'@',1)), 'admin'
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 2: Verify — confirm only YOU are admin
SELECT id, email, full_name, role FROM lms_profiles ORDER BY role;

-- Step 3: Trigger — new signups automatically get 'student' role (NEVER admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.lms_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'  -- ALL new signups are students. Set admin manually only.
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
