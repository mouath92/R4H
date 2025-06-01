-- Add language preferences to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Create posts table with language support
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  TO public
  USING (true);

-- Add index for language queries
CREATE INDEX idx_posts_lang ON posts(lang);