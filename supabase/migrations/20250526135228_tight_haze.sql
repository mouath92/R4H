/*
  # Create host applications table

  1. New Tables
    - `host_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `business_name` (text)
      - `business_type` (text)
      - `experience` (text)
      - `space_type` (text)
      - `space_location` (text)
      - `availability` (text)
      - `additional_info` (text)
      - `status` (text)
      - `submitted_at` (timestamptz)
      - `reviewed_at` (timestamptz)
      - `reviewer_notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `host_applications` table
    - Add policies for:
      - Users can create their own applications
      - Users can read their own applications
      - Admins can read and update all applications
*/

-- Create the host_applications table
CREATE TABLE IF NOT EXISTS host_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_type text NOT NULL,
  experience text NOT NULL,
  space_type text NOT NULL,
  space_location text NOT NULL,
  availability text NOT NULL,
  additional_info text,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_host_applications_user_id ON host_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_host_applications_status ON host_applications(status);

-- Enable RLS
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own applications"
  ON host_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own applications"
  ON host_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_host_applications_updated_at
  BEFORE UPDATE ON host_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();