import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

    if (verifyError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Delete conversation participants
    const { error: deleteParticipantsError } = await supabaseAdmin
      .from('conversation_participants')
      .delete()
      .eq('user_id', user.id);

    if (deleteParticipantsError) {
      throw deleteParticipantsError;
    }

    // Step 2: Delete orphaned conversations (where the user was the only participant)
    const { error: deleteOrphanedConversationsError } = await supabaseAdmin.rpc(
      'delete_orphaned_conversations'
    );

    if (deleteOrphanedConversationsError) {
      throw deleteOrphanedConversationsError;
    }

    // Step 3: Delete messages sent by the user
    const { error: deleteMessagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('sender_id', user.id);

    if (deleteMessagesError) {
      throw deleteMessagesError;
    }

    // Step 4: Delete user's bookings
    const { error: deleteBookingsError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('user_id', user.id);

    if (deleteBookingsError) {
      throw deleteBookingsError;
    }

    // Step 5: Delete user's spaces
    const { error: deleteSpacesError } = await supabaseAdmin
      .from('spaces')
      .delete()
      .eq('host_id', user.id);

    if (deleteSpacesError) {
      throw deleteSpacesError;
    }

    // Step 6: Delete user data
    const { error: deleteDataError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteDataError) {
      throw deleteDataError;
    }

    // Step 7: Delete the user's auth record
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteAuthError) {
      throw deleteAuthError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});