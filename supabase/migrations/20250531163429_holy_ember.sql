-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can read basic public data" ON users;
DROP POLICY IF EXISTS "Users can read their own full data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "User can delete their account" ON users;

-- Create new simplified policies for user signup

-- Enable signup for anyone
CREATE POLICY "Enable user signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Enable basic data reading
CREATE POLICY "Users can read basic public data"
ON users
FOR SELECT
TO public
USING (true);

-- Enable users to read their own data
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Enable users to update their own data
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Enable users to delete their account
CREATE POLICY "Users can delete their account"
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);