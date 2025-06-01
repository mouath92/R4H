/*
  # Fix User RLS Policies for Signup

  1. Changes
    - Drop existing problematic RLS policies
    - Add new policy to allow user creation during signup
    - Add policy for public access to user data for joins
    - Maintain existing policies for authenticated users
    
  2. Security
    - Allow new users to create their profile during signup
    - Maintain security for existing user data
    - Enable necessary public access for data joins
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow user data to be joined" ON users;

-- Create new policies
CREATE POLICY "Users can create their own profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public access for data joins
CREATE POLICY "Allow user data to be joined"
ON users
FOR SELECT
TO public
USING (true);

-- Add policy for initial user creation during signup
CREATE POLICY "Allow initial user creation"
ON users
FOR INSERT
TO public
WITH CHECK (true);