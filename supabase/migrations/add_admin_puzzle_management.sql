-- Add admin role support and lock down daily_puzzle writes to admins only
-- After running this migration, manually set your own row's is_admin to true:
--   UPDATE profiles SET is_admin = true WHERE id = '<your-user-id>';

-- =====================================================
-- STEP 1: Add is_admin column to profiles
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- =====================================================
-- STEP 2: Enable RLS on daily_puzzle (if not already) and
-- restrict writes to admins, while keeping reads public
-- =====================================================

ALTER TABLE daily_puzzle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to daily_puzzle" ON daily_puzzle;
CREATE POLICY "Public read access to daily_puzzle"
ON daily_puzzle
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert daily_puzzle" ON daily_puzzle;
CREATE POLICY "Admins can insert daily_puzzle"
ON daily_puzzle
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);

DROP POLICY IF EXISTS "Admins can update daily_puzzle" ON daily_puzzle;
CREATE POLICY "Admins can update daily_puzzle"
ON daily_puzzle
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);

DROP POLICY IF EXISTS "Admins can delete daily_puzzle" ON daily_puzzle;
CREATE POLICY "Admins can delete daily_puzzle"
ON daily_puzzle
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);
