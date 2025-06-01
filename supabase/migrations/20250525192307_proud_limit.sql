-- Update bookings foreign key
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
ADD CONSTRAINT bookings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Update spaces foreign key
ALTER TABLE spaces
DROP CONSTRAINT IF EXISTS spaces_host_id_fkey,
ADD CONSTRAINT spaces_host_id_fkey
  FOREIGN KEY (host_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Update messages foreign key
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Update conversation_participants foreign key
ALTER TABLE conversation_participants
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey,
ADD CONSTRAINT conversation_participants_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;