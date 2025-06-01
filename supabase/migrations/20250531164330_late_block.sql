/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing RLS policies for users table
    - Create new policies that properly handle user creation and updates
    - Ensure proper security while allowing initial user creation

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Initial user creation during signup
      - Profile updates by authenticated users
      - Profile reading by any user
      - Profile deletion by owner
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable profile creation during registration" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "User can delete their account" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow initial user creation during signup
CREATE POLICY "Enable initial user creation during signup"
ON users FOR INSERT
TO public
WITH CHECK (
  -- Allow creation only if the user is creating their own profile
  -- OR if this is the initial signup (auth.uid() is null during signup)
  auth.uid() IS NULL OR auth.uid()::uuid = id
);

-- Allow users to read any profile
CREATE POLICY "Enable read access for all users"
ON users FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON users FOR DELETE
TO authenticated
USING (auth.uid() = id);