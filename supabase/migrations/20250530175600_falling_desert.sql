/*
  # Fix avatar update policy

  1. Changes
    - Add RLS policy to allow users to update their avatar_url

  2. Security
    - Enable RLS on users table (if not already enabled)
    - Add policy for authenticated users to update their own avatar_url
    - Policy uses auth.uid() = id to ensure users can only update their own data
*/

-- First ensure RLS is enabled on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to update their own avatar_url
CREATE POLICY "Users can update their avatar_url"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure the update policy includes avatar_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$;