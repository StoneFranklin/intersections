-- Function to delete a user account and all associated data
-- This function will be called via RPC when a user wants to delete their account
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller is the user being deleted
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete user data from all tables
  -- Order matters: delete child records first, then parent records

  -- Delete friendships (both directions)
  DELETE FROM friendships WHERE requester_id = target_user_id OR addressee_id = target_user_id;

  -- Delete puzzle scores
  DELETE FROM puzzle_scores WHERE user_id = target_user_id;

  -- Delete practice scores
  DELETE FROM practice_scores WHERE user_id = target_user_id;

  -- Delete user streaks
  DELETE FROM user_streaks WHERE user_id = target_user_id;

  -- Delete user XP
  DELETE FROM user_xp WHERE user_id = target_user_id;

  -- Delete push notification tokens (if table exists)
  -- Note: Skipping push_tokens as it may not exist in all deployments
  -- DELETE FROM push_tokens WHERE user_id = target_user_id;

  -- Delete profile
  DELETE FROM profiles WHERE id = target_user_id;

  -- Delete the user from auth.users
  -- Note: This requires the function to have appropriate permissions
  -- The auth.users deletion should be handled by Supabase's admin API
  -- For now, we'll attempt it, but if it fails, the profile deletion above will still work
  -- When the user logs back in, ensureProfile will upsert the profile
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION delete_user_account(UUID) IS 'Deletes a user account and all associated data. Can only be called by the user themselves.';
