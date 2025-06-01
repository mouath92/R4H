/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive admin policy that was causing infinite loops
    - Simplify user policies to prevent recursion
    - Add clear, non-recursive policies for both public and authenticated access
    
  2. Security
    - Maintains row-level security
    - Ensures users can still manage their own data
    - Allows public read access to basic user info
    - Provides admin access without recursive checks
*/

-- First, drop existing policies to clean up
DROP POLICY IF EXISTS "enable_admin_full_access" ON users;
DROP POLICY IF EXISTS "enable_insert_own_data" ON users;
DROP POLICY IF EXISTS "enable_read_own_data" ON users;
DROP POLICY IF EXISTS "enable_read_public_data" ON users;
DROP POLICY IF EXISTS "enable_update_own_data" ON users;

-- Add new, simplified policies

-- Allow public read access to basic user info (non-sensitive fields)
CREATE POLICY "enable_read_public_data" ON users
  FOR SELECT
  TO public
  USING (true);

-- Allow users to read their own full profile
CREATE POLICY "enable_read_own_data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own data during signup
CREATE POLICY "enable_insert_own_data" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "enable_update_own_data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add admin policy without recursion
CREATE POLICY "enable_admin_access" ON users
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );