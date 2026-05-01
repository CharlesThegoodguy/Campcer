
-- Make bucket public so getPublicUrl works
UPDATE storage.buckets SET public = true WHERE id = 'simaksi';

-- Allow public read access for simaksi images
DROP POLICY IF EXISTS "Authenticated can view simaksi" ON storage.objects;
CREATE POLICY "Public can view simaksi" ON storage.objects FOR SELECT USING (bucket_id = 'simaksi');
