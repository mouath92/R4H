/*
  # Update Bookings Table for Host Confirmation Flow

  1. Changes
    - Add host_confirmation_status column
    - Add host_confirmation_date column
    - Add host_notes column
    - Update RLS policies for host confirmation
    
  2. Security
    - Add policies for hosts to update confirmation status
    - Maintain existing user access policies
*/

-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS host_confirmation_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS host_confirmation_date timestamptz,
ADD COLUMN IF NOT EXISTS host_notes text;

-- Add policy for hosts to update booking confirmation
CREATE POLICY "Hosts can update booking confirmation"
ON bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM spaces 
    WHERE spaces.id = space_id 
    AND spaces.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM spaces 
    WHERE spaces.id = space_id 
    AND spaces.host_id = auth.uid()
  )
);