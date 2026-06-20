-- Add image_url column to buses table for truck photos
ALTER TABLE buses ADD COLUMN IF NOT EXISTS image_url text;

-- NOTE: You must also create a Supabase Storage bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named "truck-images" with Public access
-- 3. Add an RLS policy to allow authenticated users to upload:
--
--    CREATE POLICY "Allow authenticated uploads"
--    ON storage.objects FOR INSERT
--    TO authenticated
--    WITH CHECK (bucket_id = 'truck-images');
--
--    CREATE POLICY "Allow public reads"
--    ON storage.objects FOR SELECT
--    TO public
--    USING (bucket_id = 'truck-images');
