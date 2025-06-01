-- Create profile picture table
CREATE TABLE IF NOT EXISTS profile_picture (
  profile_picture text,
  user_id uuid NOT NULL REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE profile_picture ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read"
ON profile_picture
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON profile_picture
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Add storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Profile Pictures Public Access'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Profile Pictures Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profile-pictures');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Profile Pictures Upload Access'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Profile Pictures Upload Access"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'profile-pictures');
  END IF;
END $$;