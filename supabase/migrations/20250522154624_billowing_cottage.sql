/*
  # Fix spaces table RLS policies

  1. Changes
    - Enable RLS if not already enabled
    - Drop existing policies safely
    - Recreate policies with proper checks
    - Remove temporary public insert policy
  
  2. Security
    - Maintain public read access for active spaces
    - Allow authenticated users to create spaces
    - Enable hosts to manage their own spaces
*/

-- Enable RLS if not already enabled
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read active spaces" ON spaces;
  DROP POLICY IF EXISTS "Allow inserts by authenticated users" ON spaces;
  DROP POLICY IF EXISTS "Hosts can manage their own spaces" ON spaces;
  DROP POLICY IF EXISTS "TEMP allow inserts from anyone" ON spaces;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Recreate policies
CREATE POLICY "Anyone can read active spaces"
ON spaces
FOR SELECT
TO public
USING (status = 'active');

CREATE POLICY "Allow inserts by authenticated users"
ON spaces
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Hosts can manage their own spaces"
ON spaces
FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);