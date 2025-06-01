-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow insert from trigger" ON public.users;
DROP POLICY IF EXISTS "Enable initial user creation" ON public.users;
DROP POLICY IF EXISTS "Enable read access" ON public.users;
DROP POLICY IF EXISTS "Enable self update" ON public.users;
DROP POLICY IF EXISTS "Enable self delete" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow insert from trigger"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable read access"
ON public.users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable self update"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable self delete"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Ensure the users table has the correct structure
ALTER TABLE public.users
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN role SET DEFAULT 'user',
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

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