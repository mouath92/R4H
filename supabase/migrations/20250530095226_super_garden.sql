/*
  # Add preferred_language to users table

  1. Changes
    - Add preferred_language column to users table
    - Set default value to 'en' for consistency
    - Allow NULL values for users who haven't set a preference

  2. Security
    - No additional security needed as users table already has RLS policies
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';