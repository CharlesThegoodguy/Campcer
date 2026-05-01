
-- Make bucket private (files still accessible via signed URLs or direct public URL since we have policies)
UPDATE storage.buckets SET public = false WHERE id = 'simaksi';

-- Move handle_new_user out of public schema (it's only used as a trigger)
-- Recreate in a non-exposed schema is not possible easily, so just revoke all execute
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

-- has_role is needed by RLS but not directly by anon/authenticated via API
-- It's called internally by RLS policies. Revoke from public role.
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
