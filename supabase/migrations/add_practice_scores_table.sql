-- Practice Scores Table for Intersections Archive
-- Run this SQL in your Supabase SQL Editor
--
-- This table tracks best scores for the archive/practice feature.
-- It's updated when:
-- 1. User completes the daily puzzle (inserted alongside puzzle_scores)
-- 2. User plays from the archive (upserted with best score)

-- =====================================================
-- STEP 1: Create practice_scores table
-- =====================================================

CREATE TABLE IF NOT EXISTS practice_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  puzzle_date DATE NOT NULL,
  best_score INTEGER NOT NULL,
  best_time_seconds INTEGER NOT NULL,
  best_mistakes INTEGER NOT NULL,
  best_correct_placements INTEGER NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_completed_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ DEFAULT NOW(),

  -- One record per user per puzzle date
  UNIQUE(user_id, puzzle_date)
);

-- =====================================================
-- STEP 2: Create indexes for efficient queries
-- =====================================================

-- Index for looking up user's practice history
CREATE INDEX IF NOT EXISTS idx_practice_scores_user_id
ON practice_scores(user_id);

-- Index for looking up by date (for potential future features)
CREATE INDEX IF NOT EXISTS idx_practice_scores_puzzle_date
ON practice_scores(puzzle_date);

-- Composite index for efficient user + date lookups
CREATE INDEX IF NOT EXISTS idx_practice_scores_user_date
ON practice_scores(user_id, puzzle_date);

-- =====================================================
-- STEP 3: Enable Row Level Security
-- =====================================================

ALTER TABLE practice_scores ENABLE ROW LEVEL SECURITY;

-- Users can only see their own practice scores
CREATE POLICY "Users can view own practice scores"
ON practice_scores FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own practice scores
CREATE POLICY "Users can insert own practice scores"
ON practice_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own practice scores
CREATE POLICY "Users can update own practice scores"
ON practice_scores FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if the table was created:
-- SELECT * FROM information_schema.tables WHERE table_name = 'practice_scores';

-- Check columns:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'practice_scores';
