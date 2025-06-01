/*
  # Fix Conversation RLS Policies

  1. Changes
    - Remove existing RLS policies for conversations table
    - Add new policies that properly handle conversation creation and access
    
  2. Security
    - Allow authenticated users to create conversations
    - Allow users to read conversations they are participants in
    - Ensure proper access control for conversation management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_insert_conversations" ON conversations;
DROP POLICY IF EXISTS "allow_read_participant_conversations" ON conversations;

-- Create new policies
CREATE POLICY "enable_conversation_creation"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_conversation_access"
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

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;