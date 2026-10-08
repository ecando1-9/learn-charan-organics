-- Add attachment columns to lms_group_messages table
ALTER TABLE public.lms_group_messages
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_type text;

-- Create storage bucket for community attachments if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-attachments', 'community-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read community attachments" ON storage.objects;
CREATE POLICY "Public read community attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-attachments');

DROP POLICY IF EXISTS "Authenticated upload community attachments" ON storage.objects;
CREATE POLICY "Authenticated upload community attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-attachments' AND auth.role() = 'authenticated');
