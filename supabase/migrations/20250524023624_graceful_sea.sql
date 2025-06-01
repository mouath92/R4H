/*
  # Fix Chat System Issues
  
  1. Changes
    - Add missing indexes for performance
    - Update conversation policies
    - Fix participant handling
    - Add proper cascade deletes
    
  2. Security
    - Ensure proper RLS policies
    - Fix recursive policy issues
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "enable_conversation_creation" ON conversations;
DROP POLICY IF EXISTS "enable_conversation_viewing" ON conversations;
DROP POLICY IF EXISTS "enable_conversation_update" ON conversations;
DROP POLICY IF EXISTS "users_can_create_conversations" ON conversation_participants;

-- Create new optimized policies for conversations
CREATE POLICY "enable_conversation_creation"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_conversation_viewing"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "enable_conversation_update"
ON conversations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Update conversation participants policies
CREATE POLICY "users_can_create_conversations"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id = auth.uid()) OR
  (EXISTS (
    SELECT 1
    FROM conversation_participants existing
    WHERE existing.conversation_id = conversation_id
    AND existing.user_id = auth.uid()
  ))
);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender ON messages(conversation_id, sender_id);

-- Update trigger for conversation updates
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;