-- Add card_id_url column to users table for national ID photos
ALTER TABLE users ADD COLUMN IF NOT EXISTS card_id_url text;

-- NOTE: You must also create a Supabase Storage bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named "staff-card-ids" with Public access
-- 3. Add RLS policies to allow authenticated users to upload and anyone to read:
--
--    CREATE POLICY "Allow authenticated uploads"
--    ON storage.objects FOR INSERT
--    TO authenticated
--    WITH CHECK (bucket_id = 'staff-card-ids');
--
--    CREATE POLICY "Allow public reads"
--    ON storage.objects FOR SELECT
--    TO public
--    USING (bucket_id = 'staff-card-ids');
