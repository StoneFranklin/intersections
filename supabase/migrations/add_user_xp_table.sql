-- Create user_xp table for tracking XP and levels
CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on level for potential leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON user_xp(level DESC, total_xp DESC);

-- Enable RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own XP
CREATE POLICY "Users can read own xp"
  ON user_xp
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow everyone to read all XP levels (for leaderboard display)
CREATE POLICY "Anyone can read xp levels"
  ON user_xp
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own XP record
CREATE POLICY "Users can insert own xp"
  ON user_xp
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own XP
CREATE POLICY "Users can update own xp"
  ON user_xp
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_xp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_user_xp_updated_at();
