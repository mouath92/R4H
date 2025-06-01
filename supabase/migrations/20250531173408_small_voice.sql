/*
  # Add role check constraint to users table

  1. Changes
    - Add check constraint to users table to validate role values
    - Only allow 'user' and 'host' as valid roles
    - Set default role to 'user'

  2. Security
    - No changes to RLS policies
    - Maintains existing table security settings
*/

DO $$ BEGIN
  -- Add check constraint for role column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'host'));
  END IF;

  -- Set default value for role if not already set
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role' 
    AND column_default = '''user''::text'
  ) THEN
    ALTER TABLE users 
    ALTER COLUMN role 
    SET DEFAULT 'user';
  END IF;
END $$;