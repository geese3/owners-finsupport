-- Fix RLS policy for government_supports table to allow API access

-- Create a policy that allows the service role to insert/update/delete for API operations
CREATE POLICY "Service role can manage government supports" ON government_supports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also allow authenticated users to read government supports
CREATE POLICY "Authenticated users can read government supports" ON government_supports
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to read government supports (for public access)
CREATE POLICY "Anonymous users can read government supports" ON government_supports
  FOR SELECT
  TO anon
  USING (true);