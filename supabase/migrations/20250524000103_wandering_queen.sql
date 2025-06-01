/*
  # Fix conversation participants policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new, optimized policies for conversation participants
    
  2. Security
    - Enable RLS (already enabled)
    - Add policy for inserting new participants
    - Add policy for viewing participants in conversations user is part of
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;

-- Create new, optimized policies
CREATE POLICY "insert_participant_policy"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can only add themselves as participants
  auth.uid() = user_id
);

CREATE POLICY "select_participant_policy"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  -- User can see participants of conversations they're in
  EXISTS (
    SELECT 1 
    FROM conversation_participants my_convos
    WHERE my_convos.conversation_id = conversation_participants.conversation_id 
    AND my_convos.user_id = auth.uid()
  )
);