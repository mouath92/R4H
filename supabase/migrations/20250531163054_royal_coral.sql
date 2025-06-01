-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can read basic public data" ON users;
DROP POLICY IF EXISTS "Users can read their own full data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies with proper permissions for signup flow

-- Allow user creation during signup (for both anon and authenticated)
CREATE POLICY "Enable user creation during signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public read access for basic user data
CREATE POLICY "Users can read basic public data"
ON users
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to read their own data
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

-- Allow users to delete their account
CREATE POLICY "User can delete their account "
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);