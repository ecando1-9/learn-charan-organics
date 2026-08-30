-- ============================================================
-- Add cloudinary_public_id to public.lms_videos
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

alter table public.lms_videos
  add column if not exists cloudinary_public_id text;

-- (Optional) Create an index to optimize queries
create index if not exists idx_lms_videos_cloudinary_public_id 
  on public.lms_videos(cloudinary_public_id) 
  where cloudinary_public_id is not null;
