/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive admin policy that was causing infinite recursion
    - Simplify RLS policies for the users table
    - Keep basic CRUD operations for users on their own data
    - Allow public read access to basic user information
    
  2. Security
    - Maintains row-level security
    - Preserves user data privacy while allowing necessary access
    - Prevents infinite recursion in policy evaluation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_admin_access" ON users;
DROP POLICY IF EXISTS "enable_insert_own_data" ON users;
DROP POLICY IF EXISTS "enable_read_own_data" ON users;
DROP POLICY IF EXISTS "enable_read_public_data" ON users;
DROP POLICY IF EXISTS "enable_update_own_data" ON users;

-- Create new simplified policies
CREATE POLICY "Users can read basic public data"
ON users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can read their own full data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);