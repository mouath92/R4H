-- Create profile-pictures bucket if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'profile-pictures'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-pictures', 'profile-pictures', true);
  END IF;
END $$;

-- Create policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Give users read access to profile pictures'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Give users read access to profile pictures"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'profile-pictures');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow users to upload their own profile picture'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow users to upload their own profile picture"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-pictures' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow users to update their own profile picture'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow users to update their own profile picture"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'profile-pictures' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow users to delete their own profile picture'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow users to delete their own profile picture"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile-pictures' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;