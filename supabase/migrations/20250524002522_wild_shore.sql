/*
  # Fix conversation participants policies

  1. Changes
    - Remove recursive policies from conversation_participants table
    - Add clear, non-recursive policies for:
      - Selecting conversation participants
      - Inserting new participants
    
  2. Security
    - Maintains RLS protection
    - Users can only:
      - View conversations they are part of
      - Create new conversation participants when they are one of the participants
*/

-- Drop existing policies to replace them with fixed versions
DROP POLICY IF EXISTS "Enable participant access" ON conversation_participants;
DROP POLICY IF EXISTS "Enable participant creation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can read their conversation participants" ON conversation_participants;

-- Add new, non-recursive policies
CREATE POLICY "users_can_view_their_conversations"
ON conversation_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_create_conversations"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow creation only if the user is one of the participants
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 
    FROM conversation_participants existing
    WHERE existing.conversation_id = conversation_participants.conversation_id 
    AND existing.user_id = auth.uid()
  )
);