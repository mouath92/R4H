/*
  # Fix Conversation RLS Policies

  1. Changes
    - Update RLS policies for conversations table
    - Add missing RLS policies for conversation creation
    - Ensure proper access control for conversation participants

  2. Security
    - Enable RLS on conversations table (already enabled)
    - Add policy for conversation creation
    - Maintain existing policies for conversation access
*/

-- Drop existing policies for conversations to avoid conflicts
DROP POLICY IF EXISTS "enable_conversation_access" ON conversations;
DROP POLICY IF EXISTS "enable_conversation_creation_for_participants" ON conversations;

-- Create new policies for conversations
CREATE POLICY "enable_conversation_access"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "enable_conversation_creation"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update conversation_participants policies to ensure proper access
DROP POLICY IF EXISTS "users_can_create_conversations" ON conversation_participants;

CREATE POLICY "users_can_create_conversations"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM conversation_participants existing
    WHERE existing.conversation_id = conversation_participants.conversation_id
    AND existing.user_id = auth.uid()
  )
);