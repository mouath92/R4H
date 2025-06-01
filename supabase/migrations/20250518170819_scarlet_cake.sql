/*
  # Add user signup policy

  1. Security Changes
    - Add RLS policy to allow new user signups
    - Policy ensures users can only insert their own data with their auth ID
    - Restricts role to 'user' for new signups (hosts must be promoted separately)

  Note: This maintains security while enabling the signup flow
*/

CREATE POLICY "Enable user signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id 
  AND role = 'user'
);