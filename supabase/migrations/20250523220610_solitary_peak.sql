/*
  # Fix Booking Status Handling

  1. Changes
    - Add updated_at column to bookings table
    - Ensure status column has proper constraints
    - Add trigger to automatically update updated_at
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add updated_at column if it doesn't exist
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for status values if it doesn't exist
DO $$ 
BEGIN 
    ALTER TABLE bookings
    ADD CONSTRAINT check_valid_status
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'));
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;