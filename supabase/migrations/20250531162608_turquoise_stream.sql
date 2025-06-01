-- First ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read basic public data" ON users;
DROP POLICY IF EXISTS "Users can read their own full data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies with proper permissions

-- Allow new user creation during signup
CREATE POLICY "Enable user creation during signup"
ON users
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to read basic public data
CREATE POLICY "Users can read basic public data"
ON users
FOR SELECT
TO public
USING (true);

-- Allow users to read their own full data
CREATE POLICY "Users can read their own full data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);