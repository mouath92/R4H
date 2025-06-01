/*
  # Add Host Applications Table

  1. New Tables
    - host_applications: Store host application submissions
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - business_name (text)
      - business_type (text)
      - experience (text)
      - space_type (text)
      - space_location (text)
      - availability (text)
      - additional_info (text)
      - status (text)
      - submitted_at (timestamptz)
      - reviewed_at (timestamptz)
      - reviewer_notes (text)
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create host_applications table
CREATE TABLE host_applications (
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
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own applications"
ON host_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create applications"
ON host_applications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM host_applications
    WHERE user_id = auth.uid() AND status = 'pending'
  )
);

-- Create index for faster queries
CREATE INDEX idx_host_applications_user_id ON host_applications(user_id);
CREATE INDEX idx_host_applications_status ON host_applications(status);