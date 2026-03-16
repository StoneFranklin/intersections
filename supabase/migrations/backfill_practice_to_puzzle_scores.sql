-- Backfill puzzle_scores from practice_scores
--
-- Before the archive leaderboard feature, archive completions only wrote
-- to practice_scores. This migration copies those records into puzzle_scores
-- so they appear on archive leaderboards.
--
-- Safe to run multiple times — the WHERE NOT EXISTS clause prevents duplicates.

INSERT INTO puzzle_scores (puzzle_date, score, time_seconds, mistakes, correct_placements, user_id, created_at)
SELECT
  ps.puzzle_date,
  ps.best_score,
  ps.best_time_seconds,
  ps.best_mistakes,
  ps.best_correct_placements,
  ps.user_id,
  ps.first_completed_at
FROM practice_scores ps
WHERE NOT EXISTS (
  SELECT 1
  FROM puzzle_scores pz
  WHERE pz.user_id = ps.user_id
    AND pz.puzzle_date = ps.puzzle_date
);
