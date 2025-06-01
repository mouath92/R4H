-- Drop existing policies
DROP POLICY IF EXISTS "Enable initial user creation during signup" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Enable initial user creation"
ON users FOR INSERT
TO public
WITH CHECK ((auth.uid() IS NULL) OR (auth.uid() = id));

CREATE POLICY "Enable read access"
ON users FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable self update"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable self delete"
ON users FOR DELETE
TO authenticated
USING (auth.uid() = id);