/*
  # Initial Schema Setup
  
  1. Storage
    - Creates space-images bucket
    - Sets up storage policies for viewing and uploading images
    
  2. Tables
    - users: Store user profiles
    - spaces: Store rental space listings
    - bookings: Store space bookings
    - messages: Store user messages
    
  3. Security
    - Enables RLS on all tables
    - Creates access policies for each table
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('space-images', 'space-images')
ON CONFLICT DO NOTHING;

-- Set up storage policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can view space images'
  ) THEN
    CREATE POLICY "Anyone can view space images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'space-images' );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload space images'
  ) THEN
    CREATE POLICY "Authenticated users can upload space images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK ( bucket_id = 'space-images' );
  END IF;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  price_per_hour numeric NOT NULL,
  size_m2 numeric NOT NULL,
  image_urls text[] NOT NULL DEFAULT '{}',
  amenities text[] NOT NULL DEFAULT '{}',
  host_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  space_id uuid REFERENCES spaces(id) NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_hours numeric NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) NOT NULL,
  recipient_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read their own data'
  ) THEN
    CREATE POLICY "Users can read their own data"
      ON users FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data"
      ON users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'spaces' 
    AND policyname = 'Anyone can read active spaces'
  ) THEN
    CREATE POLICY "Anyone can read active spaces"
      ON spaces FOR SELECT
      USING (status = 'active');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'spaces' 
    AND policyname = 'Hosts can manage their own spaces'
  ) THEN
    CREATE POLICY "Hosts can manage their own spaces"
      ON spaces FOR ALL
      TO authenticated
      USING (auth.uid() = host_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' 
    AND policyname = 'Users can read their own bookings'
  ) THEN
    CREATE POLICY "Users can read their own bookings"
      ON bookings FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' 
    AND policyname = 'Users can create bookings'
  ) THEN
    CREATE POLICY "Users can create bookings"
      ON bookings FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can read their own messages'
  ) THEN
    CREATE POLICY "Users can read their own messages"
      ON messages FOR SELECT
      TO authenticated
      USING (auth.uid() IN (sender_id, recipient_id));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON messages FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;