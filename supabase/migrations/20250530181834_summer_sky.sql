/*
  # Fix users table RLS policies for profile updates

  1. Changes
    - Add RLS policy for users to update their own avatar_url
    - Ensure users can only update their own profile data
    - Maintain existing RLS policies

  2. Security
    - Enable RLS on users table
    - Add policy for avatar_url updates
    - Restrict updates to authenticated users
    - Users can only modify their own data
*/

-- First, ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can update their avatar_url" ON users;

-- Create new policy for avatar_url updates
CREATE POLICY "Users can update their avatar_url"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure storage bucket has correct permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Set up storage policy for profile pictures
DROP POLICY IF EXISTS "Avatar storage access policy" ON storage.objects;

CREATE POLICY "Avatar storage access policy"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'profile-pictures' AND (auth.uid())::text = (SPLIT_PART(name, '-', 1)));