/*
  # Add temporary policy for spaces table
  
  This migration adds a temporary policy to allow anyone (even unauthenticated users) 
  to insert into the spaces table for testing purposes.
  
  WARNING: This is only for testing and should be removed in production!
*/

-- Drop existing insert policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'spaces' 
    AND policyname = 'Enable insert for authenticated users only'
  ) THEN
    DROP POLICY "Enable insert for authenticated users only" ON spaces;
  END IF;
END $$;

-- Create temporary policy to allow inserts from anyone
CREATE POLICY "TEMP allow inserts from anyone"
  ON spaces
  FOR INSERT
  TO public
  WITH CHECK (true);