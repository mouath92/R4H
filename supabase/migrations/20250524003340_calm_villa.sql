/*
  # Fix conversations RLS policies

  1. Changes
    - Update RLS policies for conversations table to properly handle conversation creation
    - Add policy to allow conversation creation when user is a participant
    - Keep existing policy for reading conversations

  2. Security
    - Maintain RLS enabled on conversations table
    - Ensure users can only create conversations they are part of
    - Preserve existing read access policy
*/

-- Drop existing creation policy as it's too permissive
DROP POLICY IF EXISTS "enable_conversation_creation" ON conversations;

-- Create new policy for conversation creation
CREATE POLICY "enable_conversation_creation_for_participants" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Keep existing select policy
DROP POLICY IF EXISTS "enable_conversation_access" ON conversations;
CREATE POLICY "enable_conversation_access" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
    )
  );