/*
  # Fix conversation participants RLS policies

  1. Changes
    - Remove existing RLS policies that cause recursion
    - Add simplified RLS policies for conversation participants
      - Users can insert themselves as participants
      - Users can only view conversations they are part of
      
  2. Security
    - Maintains data access security while preventing infinite recursion
    - Users can only access conversations they are participants in
    - Users can only add themselves as participants
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "insert_participant_policy" ON conversation_participants;
DROP POLICY IF EXISTS "select_participant_policy" ON conversation_participants;

-- Create new simplified policies
CREATE POLICY "Users can add themselves as participants"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can view their conversation participants"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Update conversations policy to use direct participant check
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE 
      conversation_participants.conversation_id = conversations.id 
      AND conversation_participants.user_id = auth.uid()
  )
);