/*
  # Fix Messages RLS Policy

  1. Changes
    - Update RLS policy for message creation to properly handle conversation participants
    - Ensure users can only create messages in conversations they're part of
    - Maintain security while fixing the permission issue
  
  2. Security
    - Messages can only be created by authenticated users who are participants in the conversation
    - Sender ID must match the authenticated user's ID
    - Messages can only be read by conversation participants
*/

-- Drop existing insert policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'messages' 
    AND policyname = 'Enable message creation'
  ) THEN
    DROP POLICY "Enable message creation" ON public.messages;
  END IF;
END $$;

-- Create new insert policy with proper checks
CREATE POLICY "Enable message creation" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  -- Ensure sender_id matches the authenticated user
  sender_id = auth.uid() 
  AND
  -- Verify user is a participant in the conversation
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);