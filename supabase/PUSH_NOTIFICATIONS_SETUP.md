# Push Notifications Setup Guide

This guide explains how to set up push notifications for friend requests and puzzle completions.

## Overview

The system sends push notifications when:
1. **Friend Request** - A user receives a friend request
2. **Puzzle Completion** - A friend completes the daily puzzle (shows their score and whether they beat you)

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Logged into Supabase CLI: `supabase login`
3. Project linked: `supabase link --project-ref fkgwbiqrplgneotzbwbv`

## Step 1: Run Database Migration

Run the SQL migration to add the `expo_push_token` column to the profiles table:

```sql
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_expo_push_token
ON profiles(expo_push_token)
WHERE expo_push_token IS NOT NULL;
```

## Step 2: Deploy Edge Functions

Deploy both Edge Functions from the project root:

```bash
# Deploy friend request notification function
supabase functions deploy send-friend-request-notification --project-ref fkgwbiqrplgneotzbwbv

# Deploy puzzle completion notification function
supabase functions deploy send-puzzle-completion-notification --project-ref fkgwbiqrplgneotzbwbv
```

## Step 3: Create Database Webhooks

Create webhooks in the Supabase Dashboard to trigger the Edge Functions.

### Friend Request Webhook

1. Go to **Database > Webhooks** in the Supabase Dashboard
2. Click **Create a new hook**
3. Configure:
   - **Name**: `send-friend-request-notification`
   - **Table**: `friendships`
   - **Events**: Check `Insert`
   - **Type**: `Supabase Edge Function`
   - **Edge Function**: Select `send-friend-request-notification`
4. Click **Create webhook**

### Puzzle Completion Webhook

1. Go to **Database > Webhooks** in the Supabase Dashboard
2. Click **Create a new hook**
3. Configure:
   - **Name**: `send-puzzle-completion-notification`
   - **Table**: `puzzle_scores`
   - **Events**: Check `Insert`
   - **Type**: `Supabase Edge Function`
   - **Edge Function**: Select `send-puzzle-completion-notification`
4. Click **Create webhook**

## Step 4: Verify Setup

### Test Friend Request Notification

1. Sign in to the app on two different devices/accounts
2. Send a friend request from one account to the other
3. The receiving user should get a push notification

### Test Puzzle Completion Notification

1. Add a friend (both users must accept)
2. Have one user complete the daily puzzle
3. The friend should receive a notification with the score

## How It Works

### Client Side (React Native)

1. On sign-in, the app requests notification permissions
2. Gets an Expo Push Token and stores it in the `profiles` table
3. On sign-out, the push token is cleared

### Server Side (Supabase)

1. When a new row is inserted into `friendships` or `puzzle_scores`, the webhook triggers
2. The Edge Function fetches the relevant user's push token from `profiles`
3. Sends a push notification via Expo's Push API

## Notification Content

### Friend Request
- **Title**: "New Friend Request"
- **Body**: "{Name} wants to be your friend!"
- **Action**: Opens the Friends tab

### Puzzle Completion (Friend Beat You)
- **Title**: "{Name} beat your score!"
- **Body**: "They scored {score} on today's puzzle. Can you do better?"
- **Action**: Opens the Leaderboard

### Puzzle Completion (You're Still Ahead)
- **Title**: "{Name} completed today's puzzle"
- **Body**: "They scored {score}. You're still in the lead with {yourScore}!"

### Puzzle Completion (Friend Hasn't Played)
- **Title**: "{Name} completed today's puzzle"
- **Body**: "They scored {score}. Play now to see if you can beat them!"

## Troubleshooting

### Notifications not appearing

1. Check if the user has granted notification permissions
2. Verify the push token is stored in the `profiles` table
3. Check Edge Function logs in Supabase Dashboard

### Edge Function errors

View logs in the Supabase Dashboard under **Edge Functions > Logs**

### Testing locally

You can test Edge Functions locally:

```bash
supabase functions serve send-friend-request-notification --env-file .env.local
```

Then send a test request:

```bash
curl -X POST http://localhost:54321/functions/v1/send-friend-request-notification \
  -H "Content-Type: application/json" \
  -d '{"requester_id": "...", "addressee_id": "..."}'
```
