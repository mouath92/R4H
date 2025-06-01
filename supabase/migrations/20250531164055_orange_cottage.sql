/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies for users table
    - Create new RLS policies with proper permissions for user registration
    - Enable RLS on users table

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Public read access to user profiles
      - Authenticated users can update their own profile
      - New users can create their profile during registration
      - Users can delete their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access" ON public.users;
DROP POLICY IF EXISTS "Enable user signup" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "User can delete their account" ON public.users;
DROP POLICY IF EXISTS "Users can delete their account" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable profile creation during registration"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow creation if the user is creating their own profile
    (auth.uid() = id) OR
    -- Or if no user is authenticated (during registration)
    (auth.uid() IS NULL)
  );

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);