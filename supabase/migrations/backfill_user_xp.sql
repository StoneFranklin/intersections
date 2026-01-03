-- Backfill user_xp table with entries for all existing users
-- This ensures every user has a level, even if they haven't earned XP yet

INSERT INTO user_xp (user_id, total_xp, level, updated_at)
SELECT 
  id as user_id,
  0 as total_xp,
  1 as level,
  NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_xp)
ON CONFLICT (user_id) DO NOTHING;
