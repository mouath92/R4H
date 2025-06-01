-- Add preferred_language column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Create index for faster language queries
CREATE INDEX IF NOT EXISTS idx_users_preferred_language 
ON users(preferred_language);