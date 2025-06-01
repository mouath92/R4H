/*
  # Fix conversations RLS policies

  1. Changes
    - Drop existing RLS policies for conversations table
    - Add new comprehensive RLS policies that properly handle:
      - Conversation creation by authenticated users
      - Viewing conversations by participants
      - Updating conversations by participants

  2. Security
    - Maintains RLS enabled on conversations table
    - Ensures users can only access conversations they're part of
    - Allows authenticated users to create new conversations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_can_create_conversations" ON conversations;
DROP POLICY IF EXISTS "users_can_view_their_conversations" ON conversations;

-- Create new policies
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
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = id
    AND conversation_participants.user_id = auth.uid()
  )
);