-- ============================================================
-- STEP 1: CHECK — Run this first to see what columns exist
-- ============================================================
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'lms_enrollment_requests'
order by ordinal_position;

-- ============================================================
-- STEP 2: ADD MISSING COLUMNS — Run this to fix the issue
-- ============================================================

alter table public.lms_enrollment_requests
  add column if not exists utr_number text;

alter table public.lms_enrollment_requests
  add column if not exists payment_proof_url text;

alter table public.lms_enrollment_requests
  add column if not exists course_ids uuid[] default '{}';

alter table public.lms_enrollment_requests
  add column if not exists selected_all boolean not null default false;

-- ============================================================
-- STEP 3: STORAGE BUCKET — Create if not exists
-- ============================================================
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload screenshots
drop policy if exists "Authenticated users can upload proofs" on storage.objects;
create policy "Authenticated users can upload proofs"
on storage.objects for insert
with check (
  bucket_id = 'payment-proofs'
  and auth.role() = 'authenticated'
);

-- Allow public to view (admin sees the images)
drop policy if exists "Public read payment proofs" on storage.objects;
create policy "Public read payment proofs"
on storage.objects for select
using (bucket_id = 'payment-proofs');

-- ============================================================
-- STEP 4: SET YOUR ACCOUNT AS ADMIN
-- Replace YOUR_EMAIL with your actual email
-- ============================================================
update public.lms_profiles
set role = 'admin'
where email = 'YOUR_EMAIL_HERE';

-- Confirm your role was updated:
select id, full_name, email, role
from public.lms_profiles
where email = 'YOUR_EMAIL_HERE';
