/*
  # Fix Conversation RLS Policies

  1. Changes
    - Remove duplicate policies for conversations table
    - Add clearer, more permissive policies for conversation creation
    - Ensure policies work with the conversation participants table

  2. Security
    - Maintain security by ensuring users can only access conversations they're part of
    - Allow authenticated users to create conversations
    - Ensure conversation participants can be added during creation
*/

-- First, drop the duplicate policies
DROP POLICY IF EXISTS "enable_conversation_creation" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create a single, clear policy for conversation creation
CREATE POLICY "enable_conversation_creation" ON conversations
FOR INSERT TO authenticated
WITH CHECK (true);

-- Update the conversation viewing policy to be more precise
DROP POLICY IF EXISTS "enable_conversation_viewing" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

CREATE POLICY "enable_conversation_viewing" ON conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Update the conversation update policy
DROP POLICY IF EXISTS "enable_conversation_update" ON conversations;

CREATE POLICY "enable_conversation_update" ON conversations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);