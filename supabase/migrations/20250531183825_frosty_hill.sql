-- First, drop all existing user policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "enable_user_signup" ON users;
  DROP POLICY IF EXISTS "allow_public_user_read" ON users;
  DROP POLICY IF EXISTS "allow_user_self_update" ON users;
  DROP POLICY IF EXISTS "allow_user_self_delete" ON users;
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

-- Set default role
ALTER TABLE users 
ALTER COLUMN role SET DEFAULT 'user';

-- Create new simplified policies
CREATE POLICY "enable_signup"
ON users
FOR INSERT
TO public
WITH CHECK (
  ((auth.uid() IS NULL) OR (auth.uid() = id)) AND
  (role = ANY (ARRAY['user'::text, 'host'::text]))
);

CREATE POLICY "enable_read"
ON users
FOR SELECT
TO public
USING (true);

CREATE POLICY "enable_update"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_delete"
ON users
FOR DELETE
TO authenticated
USING (auth.uid() = id);