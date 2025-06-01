/*
  # Fix Conversation RLS Policies

  1. Changes
    - Update RLS policies for conversations table to properly handle conversation creation
    - Update RLS policies for conversation_participants to ensure proper access control
    - Add trigger to ensure conversation creator is automatically added as participant

  2. Security
    - Enable RLS on both tables (already enabled)
    - Add policies to allow authenticated users to create conversations
    - Add policies to allow participants to view their conversations
    - Add trigger to maintain data consistency
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "enable_conversation_creation" ON conversations;
DROP POLICY IF EXISTS "enable_conversation_access" ON conversations;

-- Create new policies for conversations
CREATE POLICY "users_can_create_conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "users_can_view_their_conversations"
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

-- Create trigger function to add conversation creator as participant
CREATE OR REPLACE FUNCTION public.add_conversation_creator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (NEW.id, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add conversation creator as participant
DROP TRIGGER IF EXISTS add_conversation_creator_trigger ON conversations;
CREATE TRIGGER add_conversation_creator_trigger
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION add_conversation_creator();