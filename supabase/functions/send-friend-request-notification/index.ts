import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Payload from direct call
interface DirectPayload {
  requester_id: string
  addressee_id: string
}

// Payload from Supabase Database Webhook
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: {
    id: string
    requester_id: string
    addressee_id: string
    status: string
    created_at: string
    updated_at: string
  }
  old_record: null | Record<string, unknown>
}

type FriendRequestPayload = DirectPayload | WebhookPayload

function isWebhookPayload(payload: FriendRequestPayload): payload is WebhookPayload {
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: FriendRequestPayload = await req.json()

    // Extract requester_id and addressee_id from either webhook or direct payload
    let requester_id: string
    let addressee_id: string
    let status: string | undefined

    if (isWebhookPayload(payload)) {
      // Webhook payload from Supabase
      requester_id = payload.record.requester_id
      addressee_id = payload.record.addressee_id
      status = payload.record.status

      // Only send notification for pending friend requests
      if (status !== 'pending') {
        console.log('Skipping notification for non-pending status:', status)
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'Not a pending request' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Direct payload
      requester_id = payload.requester_id
      addressee_id = payload.addressee_id
    }

    console.log('Friend request notification:', { requester_id, addressee_id })

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the addressee's push token
    const { data: addresseeProfile, error: addresseeError } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', addressee_id)
      .single()

    if (addresseeError || !addresseeProfile?.expo_push_token) {
      console.log('No push token for addressee:', addressee_id)
      return new Response(
        JSON.stringify({ success: false, reason: 'No push token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the requester's display name
    const { data: requesterProfile, error: requesterError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', requester_id)
      .single()

    if (requesterError) {
      console.error('Error fetching requester profile:', requesterError)
    }

    const requesterName = requesterProfile?.display_name || 'Someone'

    // Send push notification
    await sendExpoPushNotification({
      to: addresseeProfile.expo_push_token,
      sound: 'default',
      title: 'New Friend Request',
      body: `${requesterName} wants to be your friend!`,
      data: {
        type: 'friend_request',
        requesterId: requester_id,
      },
      channelId: 'friend-requests',
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-friend-request-notification:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
