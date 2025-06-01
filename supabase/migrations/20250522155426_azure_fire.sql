/*
  # Add Host Booking Confirmation Fields and Policies

  1. Changes
    - Add notification fields to bookings table
    - Add policies for host notifications
    - Add indexes for performance

  2. Security
    - Ensure proper RLS policies for notifications
    - Restrict access to authorized hosts only
*/

-- Add notification fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS notification_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz;

-- Create index for faster booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_host_confirmation 
ON bookings(host_confirmation_status, space_id);

-- Create index for space host lookups
CREATE INDEX IF NOT EXISTS idx_spaces_host_id
ON spaces(host_id);

-- Add policy for hosts to view bookings for their spaces
CREATE POLICY "Hosts can view bookings for their spaces"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM spaces
    WHERE spaces.id = space_id
    AND spaces.host_id = auth.uid()
  )
);

-- Add policy for hosts to update booking confirmations
CREATE POLICY "Hosts can update booking confirmations"
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