-- Drop all existing policies and start fresh
DROP POLICY IF EXISTS "Allow public insert" ON public.users;
DROP POLICY IF EXISTS "Allow public read" ON public.users;
DROP POLICY IF EXISTS "Allow self update" ON public.users;
DROP POLICY IF EXISTS "Allow self delete" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Allow public insert"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public read"
ON public.users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow self update"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow self delete"
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

-- Drop and recreate role constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'host'));

-- Update the trigger function with simplified error handling
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- If there's a unique violation, just return NEW and continue
  RETURN NEW;
WHEN others THEN
  -- For any other error, log it and continue
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