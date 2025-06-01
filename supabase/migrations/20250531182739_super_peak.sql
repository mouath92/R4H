/*
  # Fix users table RLS policies

  1. Changes
    - Add proper RLS policies for user creation during signup
    - Ensure policies allow both authenticated and unauthenticated users to create profiles
    - Maintain existing policies for other operations

  2. Security
    - Enable RLS on users table (already enabled)
    - Add policy for user creation during signup
    - Preserve existing policies for user management
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "allow_signup_with_role_check" ON public.users;
DROP POLICY IF EXISTS "Allow insert from trigger" ON public.users;

-- Add new policies for user creation and management
CREATE POLICY "enable_user_signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  -- Allow creation only if:
  -- 1. The user is creating their own profile (authenticated)
  -- 2. Or it's a new signup (unauthenticated)
  -- 3. And the role is either 'user' or 'host'
  (
    (auth.uid() IS NULL) OR 
    (auth.uid() = id)
  ) AND 
  (role = ANY (ARRAY['user'::text, 'host'::text]))
);

-- Ensure other necessary policies exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'allow_public_user_read'
  ) THEN
    CREATE POLICY "allow_public_user_read"
    ON public.users
    FOR SELECT
    TO public
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'allow_user_self_update'
  ) THEN
    CREATE POLICY "allow_user_self_update"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'allow_user_self_delete'
  ) THEN
    CREATE POLICY "allow_user_self_delete"
    ON public.users
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;