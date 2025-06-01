/*
  # Add RLS policies for conversations

  1. Changes
    - Enable RLS on conversations table
    - Add policies for conversation creation and access
    - Fix participant policies

  2. Security
    - Allow authenticated users to create conversations
    - Allow users to access conversations where they are participants
    - Ensure proper access control for conversation participants
*/

-- Enable RLS on conversations table if not already enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy for creating conversations (any authenticated user can create)
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for reading conversations (users can only read conversations they're part of)
CREATE POLICY "Users can read their conversations"
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

-- Update conversation participants policies
CREATE POLICY "Users can read their conversation participants"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR 
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = auth.uid()
  )
);