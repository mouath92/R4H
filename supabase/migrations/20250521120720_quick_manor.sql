/*
  # Add payment method column to bookings table

  1. Changes
    - Add `payment_method` column to `bookings` table
      - Type: text
      - Nullable: false
      - Default: 'card'

  2. Security
    - No changes to RLS policies needed as the column will be protected by existing policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN payment_method text NOT NULL DEFAULT 'card';
  END IF;
END $$;