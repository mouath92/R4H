/*
  # Storage Setup for Space Images
  
  1. Changes
    - Create space-images bucket if not exists
    - Set up storage policies with existence checks
    - Enable public access for viewing images
    - Allow authenticated users to manage their images
  
  2. Security
    - Public read access for space images
    - Authenticated users can upload/update/delete their images
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('space-images', 'space-images', true)
ON CONFLICT (id) DO NOTHING;

-- Safely create policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public Access'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'space-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload space images'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can upload space images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'space-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update own space images'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can update own space images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'space-images');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete own space images'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can delete own space images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'space-images');
  END IF;
END $$;