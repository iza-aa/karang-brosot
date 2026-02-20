-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images bucket
-- Note: Dengan service_role key, policies ini optional
-- Tapi bisa diaktifkan untuk keamanan tambahan

-- Allow public to view images
CREATE POLICY IF NOT EXISTS "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update their images
CREATE POLICY IF NOT EXISTS "Authenticated can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY IF NOT EXISTS "Authenticated can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
