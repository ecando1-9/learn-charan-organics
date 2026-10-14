-- Fix lms_profiles RLS recursion.
--
-- Symptom:
--   Authenticated browser requests like
--   /rest/v1/lms_profiles?select=role&id=eq.<user_id>
--   fail with:
--   42P17 infinite recursion detected in policy for relation "lms_profiles"
--
-- Cause:
--   Some older policies on lms_profiles call lms_is_admin(), and lms_is_admin()
--   reads lms_profiles. Evaluating a policy on lms_profiles then re-enters the
--   same table's policies.
--
-- Important:
--   This privacy-safe version allows authenticated users to read only their own
--   profile. That fixes the recursion, but any client-side community UI that
--   reads other members directly from lms_profiles must be moved to a server
--   action/API route or a limited public profile view before this is applied.

drop policy if exists "LMS users read own profile" on public.lms_profiles;
drop policy if exists "LMS users update own profile" on public.lms_profiles;
drop policy if exists "LMS users insert own profile" on public.lms_profiles;
drop policy if exists "LMS admins manage profiles" on public.lms_profiles;
drop policy if exists "profiles_select" on public.lms_profiles;
drop policy if exists "profiles_update" on public.lms_profiles;
drop policy if exists "profiles_insert" on public.lms_profiles;
drop policy if exists "profiles_delete" on public.lms_profiles;
drop policy if exists "Users can view own profile" on public.lms_profiles;
drop policy if exists "Authenticated users can view profiles" on public.lms_profiles;
drop policy if exists "Users can update own profile" on public.lms_profiles;
drop policy if exists "Service role full access" on public.lms_profiles;

create policy "profiles_select_own"
on public.lms_profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.lms_profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.lms_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_service_role_all"
on public.lms_profiles
for all
to service_role
using (true)
with check (true);
