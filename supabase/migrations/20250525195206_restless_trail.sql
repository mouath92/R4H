/*
  # Add delete_orphaned_conversations function

  1. New Functions
    - `delete_orphaned_conversations`: Deletes conversations that have no participants
      - Returns: void
      - Security: SECURITY DEFINER to run with elevated privileges
      - Language: plpgsql

  2. Security
    - Function is marked as SECURITY DEFINER to ensure it can delete conversations
    - Only authenticated users can execute this function through RLS policies
*/

-- Create the function to delete orphaned conversations
CREATE OR REPLACE FUNCTION public.delete_orphaned_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete conversations that have no participants
  DELETE FROM conversations c
  WHERE NOT EXISTS (
    SELECT 1 
    FROM conversation_participants cp 
    WHERE cp.conversation_id = c.id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_orphaned_conversations() TO authenticated;