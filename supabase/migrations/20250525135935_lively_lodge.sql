/*
  # Add space_id to conversations table

  1. Changes
    - Add space_id column to conversations table
    - Add foreign key constraint to spaces table
    - Add index for better query performance
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add space_id column to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_space_id
ON conversations(space_id);