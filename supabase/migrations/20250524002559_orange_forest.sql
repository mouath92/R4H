/*
  # Fix Conversation RLS Policies

  1. Changes
    - Remove existing conversation RLS policies that are not working correctly
    - Add new RLS policies that properly handle conversation creation and participant management
    
  2. Security
    - Enable RLS on conversations table (already enabled)
    - Add policy for creating conversations
    - Add policy for reading conversations where user is a participant
    - Ensure policies work with conversation_participants table
*/

-- Drop existing policies that aren't working correctly
DROP POLICY IF EXISTS "Enable conversation access" ON conversations;
DROP POLICY IF EXISTS "Enable conversation creation" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can read their conversations" ON conversations;

-- Create new policies with correct logic
CREATE POLICY "allow_read_participant_conversations" ON conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

CREATE POLICY "allow_insert_conversations" ON conversations
FOR INSERT TO authenticated
WITH CHECK (true);

-- Note: We allow the initial insert because the conversation_participants
-- will be created immediately after, and those are protected by their own RLS policies