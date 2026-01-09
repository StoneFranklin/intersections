-- Add puzzle_number column to daily_puzzle table
-- This migration adds a sequential puzzle number to each puzzle,
-- where #1 is the earliest puzzle and the number increments by date.

-- =====================================================
-- STEP 1: Add puzzle_number column
-- =====================================================

ALTER TABLE daily_puzzle
ADD COLUMN IF NOT EXISTS puzzle_number INTEGER;

-- =====================================================
-- STEP 2: Backfill puzzle numbers for existing puzzles
-- =====================================================

-- Calculate and assign puzzle numbers based on chronological order
WITH numbered_puzzles AS (
  SELECT
    puzzle_date,
    ROW_NUMBER() OVER (ORDER BY puzzle_date ASC) AS puzzle_num
  FROM daily_puzzle
)
UPDATE daily_puzzle
SET puzzle_number = numbered_puzzles.puzzle_num
FROM numbered_puzzles
WHERE daily_puzzle.puzzle_date = numbered_puzzles.puzzle_date;

-- =====================================================
-- STEP 3: Make puzzle_number NOT NULL and add constraint
-- =====================================================

-- Now that all existing rows have a value, make it NOT NULL
ALTER TABLE daily_puzzle
ALTER COLUMN puzzle_number SET NOT NULL;

-- Add unique constraint to ensure no duplicate puzzle numbers
ALTER TABLE daily_puzzle
ADD CONSTRAINT unique_puzzle_number UNIQUE (puzzle_number);

-- =====================================================
-- STEP 4: Create index for efficient lookups
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_puzzle_number
ON daily_puzzle(puzzle_number);

-- =====================================================
-- STEP 5: Create function to auto-assign puzzle numbers
-- =====================================================

-- This function automatically assigns the next puzzle number
-- when a new puzzle is inserted without a puzzle_number
CREATE OR REPLACE FUNCTION assign_puzzle_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if puzzle_number is NULL
  IF NEW.puzzle_number IS NULL THEN
    -- Get the max puzzle number and add 1
    SELECT COALESCE(MAX(puzzle_number), 0) + 1
    INTO NEW.puzzle_number
    FROM daily_puzzle;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Create trigger to auto-assign puzzle numbers
-- =====================================================

DROP TRIGGER IF EXISTS auto_assign_puzzle_number ON daily_puzzle;

CREATE TRIGGER auto_assign_puzzle_number
BEFORE INSERT ON daily_puzzle
FOR EACH ROW
EXECUTE FUNCTION assign_puzzle_number();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if the column was added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'daily_puzzle' AND column_name = 'puzzle_number';

-- Verify puzzle numbers are sequential:
-- SELECT puzzle_date, puzzle_number
-- FROM daily_puzzle
-- ORDER BY puzzle_number ASC
-- LIMIT 10;

-- Check the highest puzzle number:
-- SELECT MAX(puzzle_number) as max_puzzle_number FROM daily_puzzle;
