/*
  # Fix Messages Table Schema

  1. Changes
    - Ensure created_at has default now()
    - Add indexes for better query performance
    - Update RLS policies for proper access control

  2. Security
    - Enable RLS
    - Add policies for message access and creation
*/

-- Ensure created_at has default now()
ALTER TABLE messages 
ALTER COLUMN created_at SET DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender 
ON messages(conversation_id, sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable message access" ON messages;
DROP POLICY IF EXISTS "Enable message creation" ON messages;

CREATE POLICY "Enable message access"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Enable message creation"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);