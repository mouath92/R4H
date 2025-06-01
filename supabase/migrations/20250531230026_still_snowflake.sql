-- First ensure the users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow insert from trigger" ON public.users;

-- Create policy to allow inserts from the trigger function
CREATE POLICY "Allow insert from trigger"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Update the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.insert_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role text := 'user';
  user_role text;
  user_name text;
BEGIN
  -- Safely extract role and name from metadata
  BEGIN
    user_role := (NEW.raw_user_meta_data->>'role')::text;
    IF user_role IS NULL OR user_role NOT IN ('user', 'host') THEN
      user_role := default_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_role := default_role;
  END;

  BEGIN
    user_name := (NEW.raw_user_meta_data->>'name')::text;
    IF user_name IS NULL OR user_name = '' THEN
      user_name := 'Anonymous';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_name := 'Anonymous';
  END;

  -- Insert the user profile
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
    user_name,
    user_role,
    NEW.created_at,
    NEW.created_at
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create user profile: % %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;