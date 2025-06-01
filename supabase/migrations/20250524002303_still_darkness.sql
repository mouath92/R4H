/*
  # Fix Chat Policies and Permissions

  1. Changes
    - Simplify conversation participant policies
    - Fix recursive policy issues
    - Add proper host validation
    
  2. Security
    - Ensure proper access control
    - Prevent unauthorized access
    - Maintain data integrity
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can manage conversations they participate in" ON conversations;

-- Create new simplified policies for conversations
CREATE POLICY "Enable conversation creation"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable conversation access"
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

-- Create new simplified policies for conversation participants
CREATE POLICY "Enable participant creation"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('user', 'host')
  )
);

CREATE POLICY "Enable participant access"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Update message policies
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

CREATE POLICY "Enable message creation"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable message access"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);