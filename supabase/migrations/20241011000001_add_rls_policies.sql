-- Enable RLS policies for users table

-- Users can insert their own record
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view their own record
CREATE POLICY "Users can view their own record" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can delete their own record
CREATE POLICY "Users can delete their own record" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- Enable RLS policies for user_profiles table

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Enable RLS policies for search_history table

-- Users can insert their own search history
CREATE POLICY "Users can insert their own search history" ON search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own search history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own search history
CREATE POLICY "Users can update their own search history" ON search_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "Users can delete their own search history" ON search_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS policies for bookmarks table

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own bookmarks
CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS policies for roadmap_progress table

-- Users can insert their own roadmap progress
CREATE POLICY "Users can insert their own roadmap progress" ON roadmap_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own roadmap progress
CREATE POLICY "Users can view their own roadmap progress" ON roadmap_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own roadmap progress
CREATE POLICY "Users can update their own roadmap progress" ON roadmap_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own roadmap progress
CREATE POLICY "Users can delete their own roadmap progress" ON roadmap_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS policies for uploaded_files table

-- Users can insert their own uploaded files
CREATE POLICY "Users can insert their own uploaded files" ON uploaded_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own uploaded files
CREATE POLICY "Users can view their own uploaded files" ON uploaded_files
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own uploaded files
CREATE POLICY "Users can update their own uploaded files" ON uploaded_files
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete their own uploaded files" ON uploaded_files
  FOR DELETE
  USING (auth.uid() = user_id);