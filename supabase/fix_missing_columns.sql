-- ============================================================
-- MIGRATION: Add missing columns to lms_enrollment_requests
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1. Add utr_number (bank/UPI transaction reference)
alter table public.lms_enrollment_requests
  add column if not exists utr_number text;

-- 2. Add payment_proof_url (Supabase Storage public URL of screenshot)
alter table public.lms_enrollment_requests
  add column if not exists payment_proof_url text;

-- 3. Add course_ids (array of course UUIDs selected by student)
alter table public.lms_enrollment_requests
  add column if not exists course_ids uuid[] default '{}';

-- 4. Add selected_all flag (true = student chose "All Courses" bundle)
alter table public.lms_enrollment_requests
  add column if not exists selected_all boolean not null default false;

-- ============================================================
-- STORAGE BUCKET: Create payment-proofs bucket (if not done)
-- ============================================================

-- Run this ONLY if the bucket does not exist yet:
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to payment-proofs
drop policy if exists "Authenticated users can upload proofs" on storage.objects;
create policy "Authenticated users can upload proofs"
on storage.objects for insert
with check (
  bucket_id = 'payment-proofs'
  and auth.role() = 'authenticated'
);

-- Allow public read (so admin can see the image URLs)
drop policy if exists "Public read payment proofs" on storage.objects;
create policy "Public read payment proofs"
on storage.objects for select
using (bucket_id = 'payment-proofs');
