/*
  # Fix Conversation Duplicates

  1. Changes
    - Add unique constraint to prevent duplicate participant pairs
    - Add index for better query performance
    
  2. Security
    - No changes to RLS policies needed
*/

-- Add unique constraint to prevent duplicate participant pairs
CREATE UNIQUE INDEX IF NOT EXISTS unique_conversation_pair 
ON conversation_participants (conversation_id, user_id);

-- Add index for better performance when querying conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conv
ON conversation_participants (user_id, conversation_id);