
-- Revoke anon execute on security definer functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Remove the broad listing policy and add a more specific one
DROP POLICY IF EXISTS "Anyone can view simaksi" ON storage.objects;
CREATE POLICY "Authenticated can view simaksi" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'simaksi');
