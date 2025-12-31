-- Push Notifications Setup for Intersections
-- Run this SQL in your Supabase SQL Editor
--
-- This migration adds the expo_push_token column to the profiles table.
-- The database webhooks will be configured via the Supabase Dashboard.

-- =====================================================
-- STEP 1: Add expo_push_token column to profiles table
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token
ON profiles(expo_push_token)
WHERE expo_push_token IS NOT NULL;


-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if the column was added:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'expo_push_token';


-- =====================================================
-- NEXT STEPS (Do these in Supabase Dashboard)
-- =====================================================
--
-- 1. Deploy Edge Functions:
--    npx supabase functions deploy send-friend-request-notification
--    npx supabase functions deploy send-puzzle-completion-notification
--
-- 2. Create Database Webhooks in Supabase Dashboard:
--
--    a) Friend Request Webhook:
--       - Go to Database > Webhooks > Create Webhook
--       - Name: send-friend-request-notification
--       - Table: friendships
--       - Events: INSERT
--       - Type: Supabase Edge Function
--       - Edge Function: send-friend-request-notification
--       - HTTP Headers: Add Authorization header with service role key
--
--    b) Puzzle Completion Webhook:
--       - Go to Database > Webhooks > Create Webhook
--       - Name: send-puzzle-completion-notification
--       - Table: puzzle_scores
--       - Events: INSERT
--       - Type: Supabase Edge Function
--       - Edge Function: send-puzzle-completion-notification
--       - HTTP Headers: Add Authorization header with service role key
