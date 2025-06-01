/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - role (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - spaces
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - address (text)
      - price_per_hour (numeric)
      - size_m2 (numeric)
      - image_urls (text[])
      - amenities (text[])
      - host_id (uuid, references users)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - bookings
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - space_id (uuid, references spaces)
      - date (date)
      - start_time (time)
      - end_time (time)
      - duration_hours (numeric)
      - total_price (numeric)
      - status (text)
      - created_at (timestamptz)
    
    - messages
      - id (uuid, primary key)
      - sender_id (uuid, references users)
      - recipient_id (uuid, references users)
      - content (text)
      - created_at (timestamptz)
      - read (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create spaces table
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

-- Create bookings table
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

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) NOT NULL,
  recipient_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for spaces table
CREATE POLICY "Anyone can read active spaces"
  ON spaces
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Hosts can manage their own spaces"
  ON spaces
  FOR ALL
  TO authenticated
  USING (auth.uid() = host_id);

-- Create policies for bookings table
CREATE POLICY "Users can read their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Hosts can read bookings for their spaces"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM spaces 
    WHERE spaces.id = space_id 
    AND spaces.host_id = auth.uid()
  ));

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for messages table
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);