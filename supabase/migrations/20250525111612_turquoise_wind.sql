/*
  # Fix Conversation Participants RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies for conversation participants
    - Fix RLS policy expressions to avoid using NEW keyword
    
  2. Security
    - Users can only create conversations they're part of
    - Users can only view conversations they're participating in
*/

-- Drop existing policies safely
DROP POLICY IF EXISTS "users_can_create_conversations" ON conversation_participants;
DROP POLICY IF EXISTS "users_can_view_their_conversations" ON conversation_participants;

-- Create policy for inserting conversation participants
CREATE POLICY "users_can_create_conversations"
ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 
    FROM conversation_participants existing
    WHERE existing.conversation_id = conversation_id 
    AND existing.user_id = auth.uid()
  )
);

-- Create policy for viewing conversation participants
CREATE POLICY "users_can_view_their_conversations"
ON conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);