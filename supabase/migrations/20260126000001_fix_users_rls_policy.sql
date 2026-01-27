-- Fix infinite recursion in users table RLS policy
-- The issue is that the policy is trying to join with users relation causing recursion

-- Drop problematic policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Service role can view all users" ON public.users;

-- Create new safe RLS policies for users table without self-referencing joins
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own account"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- Create policy for service role to manage users
CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for clarity
COMMENT ON POLICY "Users can view all users" ON public.users IS 'Allow all authenticated users to view all users';
COMMENT ON POLICY "Users can update their own profile" ON public.users IS 'Users can only update their own profile';
COMMENT ON POLICY "Users can delete their own account" ON public.users IS 'Users can only delete their own account';
COMMENT ON POLICY "Service role can manage users" ON public.users IS 'Service role has full access to manage users';

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON SEQUENCES users_id_seq TO authenticated;
