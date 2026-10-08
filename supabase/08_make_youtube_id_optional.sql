-- ============================================================
-- Allow youtube_video_id to be NULL in lms_videos table
-- (Allows lessons to use Bunny Stream exclusively without requiring a YouTube video ID)
-- ============================================================

ALTER TABLE public.lms_videos 
  ALTER COLUMN youtube_video_id DROP NOT NULL;
