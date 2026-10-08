-- ============================================================
-- EMERGENCY FIX — Run immediately in Supabase SQL Editor
-- Sets ONLY yuvakiranreddy7@gmail.com as admin
-- Demotes ALL others to student
-- Deletes the suspicious attacker account
-- ============================================================

-- Step 1: Demote EVERYONE to student first
UPDATE lms_profiles SET role = 'student';

-- Step 2: Set ONLY the real admin
UPDATE lms_profiles
SET role = 'admin'
WHERE email = 'yuvakiranreddy7@gmail.com';

-- Step 3: DELETE the suspicious attacker account entirely
-- This removes from lms_profiles AND auth.users
DELETE FROM lms_profiles WHERE email = 'secattacker+auth@charanorganics.com';
DELETE FROM auth.users WHERE email = 'secattacker+auth@charanorganics.com';

-- Step 4: Verify - should show ONLY yuvakiranreddy7@gmail.com as admin
SELECT id, email, full_name, role FROM lms_profiles ORDER BY role, email;
