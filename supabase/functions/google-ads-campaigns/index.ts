import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface Campaign {
  id: string;
  name: string;
  budget: number;
  status: string;
}

async function logError(supabaseClient: any, userId: string, error: any, context: string) {
  try {
    const { error: logError } = await supabaseClient
      .from('api_logs')
      .insert({
        user_id: userId,
        error_message: error.message || JSON.stringify(error),
        error_details: JSON.stringify(error),
        context: context,
        api: 'google_ads',
        severity: 'error'
      })

    if (logError) {
      console.error('Error saving log:', logError)
    }
  } catch (e) {
    console.error('Error in logError function:', e)
  }
}

async function logInfo(supabaseClient: any, userId: string, message: string, context: string, details?: any) {
  try {
    const { error: logError } = await supabaseClient
      .from('api_logs')
      .insert({
        user_id: userId,
        message: message,
        details: details ? JSON.stringify(details) : null,
        context: context,
        api: 'google_ads',
        severity: 'info'
      })

    if (logError) {
      console.error('Error saving info log:', logError)
    }
  } catch (e) {
    console.error('Error in logInfo function:', e)
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let supabaseClient;
  let userId;

  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customer_id')
    
    if (!customerId) {
      throw new Error('Missing customer_id parameter')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    console.log('Initializing Supabase client...')
    // Initialize Supabase client
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user ID from JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('Error getting user: ' + userError?.message)
    }

    userId = user.id
    await logInfo(supabaseClient, userId, `Starting campaign fetch for customer ${customerId}`, 'google_ads_campaigns')

    console.log('Getting user tokens from database...')
    // Get user tokens from database
    const { data: userData, error: userDataError } = await supabaseClient
      .from('usuarios')
      .select('google_ads_token, google_ads_refresh_token')
      .eq('user_id', user.id)
      .single()

    if (userDataError || !userData) {
      await logError(supabaseClient, userId, userDataError || 'No user data found', 'google_ads_campaigns')
      throw new Error('Error getting user data: ' + userDataError?.message)
    }

    let accessToken = userData.google_ads_token

    // Check if we need to refresh the token
    if (!accessToken && userData.google_ads_refresh_token) {
      console.log('Refreshing access token...')
      await logInfo(supabaseClient, userId, 'Refreshing Google Ads access token', 'google_ads_campaigns')

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      if (!clientId || !clientSecret) {
        await logError(supabaseClient, userId, 'Missing Google OAuth credentials', 'google_ads_campaigns')
        throw new Error('Missing Google OAuth credentials')
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: userData.google_ads_refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text()
        await logError(supabaseClient, userId, {
          message: 'Token refresh failed',
          details: errorText
        }, 'google_ads_campaigns')
        throw new Error('Failed to refresh token: ' + errorText)
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      await logInfo(supabaseClient, userId, 'Access token refreshed successfully', 'google_ads_campaigns')

      console.log('Updating access token in database...')
      // Update the access token in the database
      const { error: updateError } = await supabaseClient
        .from('usuarios')
        .update({ google_ads_token: accessToken })
        .eq('user_id', user.id)

      if (updateError) {
        await logError(supabaseClient, userId, updateError, 'google_ads_campaigns')
        console.error('Error updating access token:', updateError)
      }
    }

    if (!accessToken) {
      await logError(supabaseClient, userId, 'No access token available', 'google_ads_campaigns')
      throw new Error('No access token available')
    }

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
    if (!developerToken) {
      await logError(supabaseClient, userId, 'Missing Google Ads developer token', 'google_ads_campaigns')
      throw new Error('Missing Google Ads developer token')
    }

    // Verificar se é uma conta de teste
    const isTestAccount = customerId.startsWith('1111111111');

    await logInfo(supabaseClient, userId, `Fetching campaigns for ${isTestAccount ? 'test' : 'production'} account ${customerId}`, 'google_ads_campaigns');

    const campaignsResponse = await fetch(
      `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
          'login-customer-id': customerId
        },
        body: JSON.stringify({
          query: `
            SELECT
              campaign.id,
              campaign.name,
              campaign.status,
              campaign_budget.amount_micros
            FROM campaign
            WHERE campaign.status != 'REMOVED'
            ORDER BY campaign.name ASC
          `
        })
      }
    );

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text();
      console.error('Error fetching campaigns:', errorText);
      
      await logError(supabaseClient, userId, {
        message: 'Failed to fetch campaigns',
        details: errorText,
        customerId: customerId,
        isTestAccount
      }, 'google_ads_campaigns');
      
      throw new Error('Failed to fetch campaigns data');
    }

    const campaignsData = await campaignsResponse.json()
    console.log('Campaigns data:', JSON.stringify(campaignsData))

    if (!campaignsData.results) {
      await logError(supabaseClient, userId, {
        message: 'Invalid campaigns response format',
        response: campaignsData,
        customerId: customerId
      }, 'google_ads_campaigns')
      throw new Error('Invalid response format from Google Ads API')
    }

    const campaigns = campaignsData.results?.map((result: any) => {
      // Função auxiliar para converter micros em reais
      const microToReal = (micros: string | undefined) => 
        micros ? parseFloat(micros) / 1000000 : 0;

      const campaign = result.campaign;
      
      return {
        id: campaign.id,
        name: campaign.name,
        budget: microToReal(result.campaignBudget.amountMicros),
        status: campaign.status.toLowerCase()
      };
    }) || [];

    await logInfo(supabaseClient, userId, `Successfully fetched ${campaigns.length} campaigns`, 'google_ads_campaigns', {
      campaignCount: campaigns.length,
      customerId: customerId
    })

    return new Response(
      JSON.stringify({ campaigns }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error.message)
    
    // Se temos o cliente Supabase e userId, logamos o erro
    if (supabaseClient && userId) {
      await logError(supabaseClient, userId, error, 'google_ads_campaigns')
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
