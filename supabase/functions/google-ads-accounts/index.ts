import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  autoTaggingEnabled: boolean;
  isTestAccount?: boolean;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
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
    const { test_mode } = await req.json()
    console.log('Test mode:', test_mode)

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

    await logInfo(supabaseClient, userId, 'Starting Google Ads accounts fetch', 'google_ads_accounts')

    console.log('Getting user tokens from database...')
    // Get user tokens from database
    const { data: userData, error: userDataError } = await supabaseClient
      .from('usuarios')
      .select('google_ads_token, google_ads_refresh_token')
      .eq('user_id', user.id)
      .single()

    if (userDataError || !userData) {
      await logError(supabaseClient, userId, userDataError || 'No user data found', 'google_ads_accounts')
      throw new Error('Error getting user data: ' + userDataError?.message)
    }

    console.log('User data retrieved:', {
      hasToken: !!userData.google_ads_token,
      hasRefreshToken: !!userData.google_ads_refresh_token
    })

    let accessToken = userData.google_ads_token

    // Check if we need to refresh the token
    if (!accessToken && userData.google_ads_refresh_token) {
      console.log('Refreshing access token...')
      await logInfo(supabaseClient, userId, 'Refreshing Google Ads access token', 'google_ads_accounts')

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      if (!clientId || !clientSecret) {
        await logError(supabaseClient, userId, 'Missing Google OAuth credentials', 'google_ads_accounts')
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
        }, 'google_ads_accounts')
        throw new Error('Failed to refresh token: ' + errorText)
      }

      const refreshData: TokenResponse = await refreshResponse.json()
      accessToken = refreshData.access_token
      await logInfo(supabaseClient, userId, 'Access token refreshed successfully', 'google_ads_accounts')

      // Update the access token in the database
      const { error: updateError } = await supabaseClient
        .from('usuarios')
        .update({ google_ads_token: accessToken })
        .eq('user_id', user.id)

      if (updateError) {
        await logError(supabaseClient, userId, updateError, 'google_ads_accounts')
        console.error('Error updating access token:', updateError)
      }
    }

    if (!accessToken) {
      await logError(supabaseClient, userId, 'No access token available', 'google_ads_accounts')
      throw new Error('No access token available')
    }

    console.log('Using access token:', accessToken.substring(0, 10) + '...')

    const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')
    if (!developerToken) {
      await logError(supabaseClient, userId, 'Missing Google Ads developer token', 'google_ads_accounts')
      throw new Error('Missing Google Ads developer token')
    }

    let accounts: any[] = [];
    let useFallback = false;

    // Primeiro, tenta buscar todas as contas no modo produção
    if (!test_mode) {
      try {
        const response = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': developerToken,
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error fetching customers:', errorText);
          
          // Se o erro for DEVELOPER_TOKEN_NOT_APPROVED, tenta o fallback
          if (errorText.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
            useFallback = true;
            await logInfo(supabaseClient, userId, 'Developer token not approved, falling back to test accounts', 'google_ads_accounts');
          } else {
            throw new Error(`Failed to fetch customers: ${errorText}`);
          }
        } else {
          const data = await response.json();
          const customerIds = data.resourceNames.map((name: string) => name.split('/')[1]);
          
          // Busca detalhes de cada conta
          for (const customerId of customerIds) {
            const accountResponse = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': developerToken,
              }
            });

            if (accountResponse.ok) {
              const account = await accountResponse.json();
              accounts.push({
                customerId: account.id,
                descriptiveName: account.descriptiveName || `Account ${account.id}`,
                currencyCode: account.currencyCode,
                timeZone: account.timeZone,
                autoTaggingEnabled: account.autoTaggingEnabled,
                isTestAccount: account.testAccount === true
              });
            }
          }
        }
      } catch (error) {
        console.error('Error in production mode:', error);
        useFallback = true;
        await logError(supabaseClient, userId, error, 'google_ads_accounts_production');
      }
    }

    // Se estiver em modo teste ou se precisar usar fallback
    if (test_mode || useFallback) {
      try {
        // Primeiro tenta buscar todas as contas de teste
        const testResponse = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': developerToken,
          }
        });

        if (testResponse.ok) {
          const data = await testResponse.json();
          const customerIds = data.resourceNames.map((name: string) => name.split('/')[1]);
          
          for (const customerId of customerIds) {
            const accountResponse = await fetch(`https://googleads.googleapis.com/v14/customers/${customerId}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': developerToken,
              }
            });

            if (accountResponse.ok) {
              const account = await accountResponse.json();
              if (account.testAccount === true) {
                accounts.push({
                  customerId: account.id,
                  descriptiveName: account.descriptiveName || `Account ${account.id}`,
                  currencyCode: account.currencyCode,
                  timeZone: account.timeZone,
                  autoTaggingEnabled: account.autoTaggingEnabled,
                  isTestAccount: true
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching test accounts:', error);
        await logError(supabaseClient, userId, error, 'google_ads_accounts_test');
      }

      // Se não encontrou nenhuma conta de teste, usa a conta fixa
      if (accounts.length === 0) {
        await logInfo(supabaseClient, userId, 'No test accounts found, using fixed test account', 'google_ads_accounts');
        accounts.push({
          customerId: '2051368193',
          descriptiveName: 'Conta de Teste',
          currencyCode: 'BRL',
          timeZone: 'America/Sao_Paulo',
          autoTaggingEnabled: false,
          isTestAccount: true
        });
      }
    }

    return new Response(JSON.stringify({
      accounts
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error.message)
    
    // Se temos o cliente Supabase e userId, logamos o erro
    if (supabaseClient && userId) {
      await logError(supabaseClient, userId, error, 'google_ads_accounts')
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