/*
  # Add payment status tracking to bookings

  1. Changes
    - Add `payment_status` column to `bookings` table
      - Type: text
      - Default: 'pending'
      - Not nullable
    - This allows tracking the payment status of each booking

  2. Security
    - No changes to RLS policies needed
    - Existing booking policies will cover the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;