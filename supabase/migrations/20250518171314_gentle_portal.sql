/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing policies and recreate them with correct permissions
    - Add policy for users to create their own profiles
    - Add policy for users to read their own data
    - Add policy for users to update their own data
  
  2. Security
    - Ensure RLS is enabled
    - Add proper policies for CRUD operations
*/

-- First enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable user signup" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new policies
CREATE POLICY "Users can create their own profile"
ON users FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);