-- Drop existing policies safely
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable initial user creation" ON users;
  DROP POLICY IF EXISTS "Enable read access" ON users;
  DROP POLICY IF EXISTS "Enable self update" ON users;
  DROP POLICY IF EXISTS "Enable self delete" ON users;
  DROP POLICY IF EXISTS "Allow insert for authenticated users" ON users;
  DROP POLICY IF EXISTS "Enable public read" ON users;
  DROP POLICY IF EXISTS "Allow public signup" ON users;
  DROP POLICY IF EXISTS "Enable user self update" ON users;
  DROP POLICY IF EXISTS "Enable user self delete" ON users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add role constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'host'));
  END IF;
END $$;

-- Set default role if not set
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'user';

-- Create new policies with unique names
CREATE POLICY "users_allow_public_signup"
ON users FOR INSERT
TO public
WITH CHECK (
  role IN ('user', 'host') AND
  (auth.uid() IS NULL OR auth.uid() = id)
);

CREATE POLICY "users_allow_public_read"
ON users FOR SELECT
TO public
USING (true);

CREATE POLICY "users_allow_self_update"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_allow_self_delete"
ON users FOR DELETE
TO authenticated
USING (auth.uid() = id);