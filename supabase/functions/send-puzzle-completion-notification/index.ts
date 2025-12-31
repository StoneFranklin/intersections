import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Payload from direct call
interface DirectPayload {
  user_id: string
  score: number
  puzzle_date: string
}

// Payload from Supabase Database Webhook
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: {
    id: string
    user_id: string | null
    score: number
    puzzle_date: string
    time_seconds: number
    mistakes: number
    correct_placements: number
    created_at: string
  }
  old_record: null | Record<string, unknown>
}

type PuzzleCompletionPayload = DirectPayload | WebhookPayload

function isWebhookPayload(payload: PuzzleCompletionPayload): payload is WebhookPayload {
  return 'type' in payload && 'record' in payload
}

interface ExpoPushMessage {
  to: string
  sound: 'default' | null
  title: string
  body: string
  data: Record<string, unknown>
  channelId?: string
}

async function sendExpoPushNotification(message: ExpoPushMessage): Promise<void> {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Expo push notification failed:', errorText)
    throw new Error(`Failed to send push notification: ${errorText}`)
  }

  const result = await response.json()
  console.log('Expo push notification result:', result)
}

async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Expo push notifications failed:', errorText)
    throw new Error(`Failed to send push notifications: ${errorText}`)
  }

  const result = await response.json()
  console.log('Expo push notifications result:', result)
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: PuzzleCompletionPayload = await req.json()

    // Extract fields from either webhook or direct payload
    let user_id: string | null
    let score: number
    let puzzle_date: string

    if (isWebhookPayload(payload)) {
      // Webhook payload from Supabase
      user_id = payload.record.user_id
      score = payload.record.score
      puzzle_date = payload.record.puzzle_date
    } else {
      // Direct payload
      user_id = payload.user_id
      score = payload.score
      puzzle_date = payload.puzzle_date
    }

    // Skip if no user_id (anonymous submission)
    if (!user_id) {
      console.log('Skipping notification for anonymous score submission')
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Anonymous submission' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Puzzle completion notification:', { user_id, score, puzzle_date })

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the completing user's display name
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user profile:', userError)
    }

    const userName = userProfile?.display_name || 'A friend'

    // Get all friends of this user
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user_id},addressee_id.eq.${user_id}`)

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch friendships' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!friendships || friendships.length === 0) {
      console.log('No friends to notify')
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract friend IDs
    const friendIds = friendships.map(f =>
      f.requester_id === user_id ? f.addressee_id : f.requester_id
    )

    // Get friend profiles with push tokens
    const { data: friendProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, expo_push_token')
      .in('id', friendIds)
      .not('expo_push_token', 'is', null)

    if (profilesError) {
      console.error('Error fetching friend profiles:', profilesError)
    }

    if (!friendProfiles || friendProfiles.length === 0) {
      console.log('No friends with push tokens')
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get friends' scores for today's puzzle
    const { data: friendScores, error: scoresError } = await supabase
      .from('puzzle_scores')
      .select('user_id, score')
      .eq('puzzle_date', puzzle_date)
      .in('user_id', friendIds)

    if (scoresError) {
      console.error('Error fetching friend scores:', scoresError)
    }

    // Create a map of friend ID to their score
    const friendScoreMap = new Map<string, number>()
    if (friendScores) {
      for (const fs of friendScores) {
        friendScoreMap.set(fs.user_id, fs.score)
      }
    }

    // Prepare notifications for each friend
    const notifications: ExpoPushMessage[] = []

    for (const friend of friendProfiles) {
      if (!friend.expo_push_token) continue

      const friendScore = friendScoreMap.get(friend.id)
      let title: string
      let body: string

      if (friendScore !== undefined) {
        // Friend has already played today
        if (score > friendScore) {
          // User beat their friend
          title = `${userName} beat your score!`
          body = `They scored ${score} on today's puzzle. Can you do better?`
        } else {
          // Friend is still ahead
          title = `${userName} completed today's puzzle`
          body = `They scored ${score}. You're still in the lead with ${friendScore}!`
        }
      } else {
        // Friend hasn't played yet
        title = `${userName} completed today's puzzle`
        body = `They scored ${score}. Play now to see if you can beat them!`
      }

      notifications.push({
        to: friend.expo_push_token,
        sound: 'default',
        title,
        body,
        data: {
          type: 'puzzle_completion',
          userId: user_id,
          score,
        },
        channelId: 'puzzle-completions',
      })
    }

    // Send all notifications
    if (notifications.length > 0) {
      await sendExpoPushNotifications(notifications)
    }

    return new Response(
      JSON.stringify({ success: true, notified: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-puzzle-completion-notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
