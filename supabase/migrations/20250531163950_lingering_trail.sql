-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable user signup" ON users;
DROP POLICY IF EXISTS "Users can read basic public data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their account" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies for user signup flow
CREATE POLICY "Enable user signup"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read access"
ON users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their account"
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);