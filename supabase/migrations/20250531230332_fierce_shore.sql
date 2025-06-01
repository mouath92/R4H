-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow insert from trigger" ON public.users;
DROP POLICY IF EXISTS "Enable read access" ON public.users;
DROP POLICY IF EXISTS "Enable self update" ON public.users;
DROP POLICY IF EXISTS "Enable self delete" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a single policy for public insert
CREATE POLICY "Allow public insert"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy for public read access
CREATE POLICY "Allow public read"
ON public.users
FOR SELECT
TO public
USING (true);

-- Create policy for self updates
CREATE POLICY "Allow self update"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy for self deletion
CREATE POLICY "Allow self delete"
ON public.users
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Update the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.insert_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'name')::text, 'Anonymous'),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'user'),
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'Failed to create user profile: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.insert_user_profile();

-- Ensure the users table has the correct structure
ALTER TABLE public.users
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN role SET DEFAULT 'user',
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Add role constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'host'));