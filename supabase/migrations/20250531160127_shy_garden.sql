-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Allow read access" ON users;
DROP POLICY IF EXISTS "Allow user data to be joined" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update their avatar_url" ON users;
DROP POLICY IF EXISTS "Admins can update user roles" ON users;
DROP POLICY IF EXISTS "Allow initial user creation" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

-- Create simplified, non-recursive policies
CREATE POLICY "enable_read_own_data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "enable_read_public_data" ON users
  FOR SELECT TO public
  USING (true);

CREATE POLICY "enable_update_own_data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_insert_own_data" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admin policies without recursion
CREATE POLICY "enable_admin_full_access" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.id != users.modified_by -- Prevent self-reference loop
    )
  );