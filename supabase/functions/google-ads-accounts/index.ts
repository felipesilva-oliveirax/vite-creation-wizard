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

    // Se estiver em modo teste, usar diretamente a conta de teste
    if (test_mode) {
      console.log('Test mode enabled, using test account...')
      await logInfo(supabaseClient, userId, 'Test mode enabled, using test account', 'google_ads_accounts')

      const testAccountId = '2051368193'

      const accounts = [{
        customerId: testAccountId,
        descriptiveName: `Test Account ${testAccountId}`,
        currencyCode: 'USD',
        timeZone: 'America/New_York',
        autoTaggingEnabled: false,
        isTestAccount: true
      }]

      return new Response(
        JSON.stringify({ accounts }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log('Fetching Google Ads accounts...')
    await logInfo(supabaseClient, userId, 'Fetching Google Ads accounts', 'google_ads_accounts')

    try {
      const response = await fetch(
        'https://googleads.googleapis.com/v18/customers:listAccessibleCustomers',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': developerToken,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google Ads API error:', errorText)
        await logError(supabaseClient, userId, {
          message: 'Google Ads API error',
          details: errorText
        }, 'google_ads_accounts')
        
        // Se o token não estiver aprovado, buscar todas as contas de teste disponíveis
        if (errorText.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
          console.log('Developer token not approved, searching for test accounts...')
          await logInfo(supabaseClient, userId, 'Developer token not approved, searching for test accounts', 'google_ads_accounts')
          
          try {
            // Buscar contas de teste usando endpoint específico
            const testResponse = await fetch(
              'https://googleads.googleapis.com/v18/customers:listAccessibleCustomers',
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'developer-token': developerToken,
                },
              }
            )

            if (testResponse.ok) {
              const testData = await testResponse.json()
              const { resourceNames } = testData

              if (resourceNames && Array.isArray(resourceNames)) {
                const testAccounts: GoogleAdsAccount[] = []

                for (const resourceName of resourceNames) {
                  const customerId = resourceName.split('/').pop()
                  if (!customerId) continue

                  try {
                    const accountResponse = await fetch(
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
                              customer.id,
                              customer.descriptive_name,
                              customer.test_account
                            FROM customer
                            WHERE customer.id = '${customerId}'
                          `
                        })
                      }
                    )

                    if (accountResponse.ok) {
                      const details = await accountResponse.json()
                      const account = details.results?.[0]?.customer
                      
                      if (account && account.testAccount === true) {
                        testAccounts.push({
                          customerId: account.id,
                          descriptiveName: account.descriptiveName || `Test Account ${account.id}`,
                          isTestAccount: true
                        })
                      }
                    } else {
                      const errorText = await accountResponse.text()
                      await logError(supabaseClient, userId, {
                        message: `Error fetching test account ${customerId}`,
                        details: errorText
                      }, 'google_ads_accounts')
                    }
                  } catch (error) {
                    await logError(supabaseClient, userId, {
                      message: `Error processing test account ${customerId}`,
                      error: error
                    }, 'google_ads_accounts')
                    console.error(`Error fetching test account ${customerId}:`, error)
                  }
                }

                // Se encontrou contas de teste, retorna todas elas
                if (testAccounts.length > 0) {
                  await logInfo(supabaseClient, userId, `Found ${testAccounts.length} test accounts`, 'google_ads_accounts', {
                    accountCount: testAccounts.length,
                    accounts: testAccounts
                  })

                  return new Response(
                    JSON.stringify({ accounts: testAccounts }),
                    {
                      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                      status: 200,
                    }
                  )
                }
              }
            } else {
              const errorText = await testResponse.text()
              await logError(supabaseClient, userId, {
                message: 'Error fetching test accounts list',
                details: errorText
              }, 'google_ads_accounts')
            }
          } catch (error) {
            await logError(supabaseClient, userId, {
              message: 'Error in test accounts fetch process',
              error: error
            }, 'google_ads_accounts')
            console.error('Error fetching test accounts:', error)
          }

          // Se não encontrou nenhuma conta de teste ou houve erro, retorna a conta de teste padrão
          console.log('No test accounts found, using default test account')
          await logInfo(supabaseClient, userId, 'No test accounts found, using default test account', 'google_ads_accounts')
          
          const testAccountId = '2051368193'
          
          const accounts = [{
            customerId: testAccountId,
            descriptiveName: `Test Account ${testAccountId}`,
            isTestAccount: true
          }]

          return new Response(
            JSON.stringify({ accounts }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        
        throw new Error(`Google Ads API error: ${errorText}`)
      }

      const responseData = await response.json()
      console.log('Available accounts:', JSON.stringify(responseData))

      const { resourceNames } = responseData
      if (!resourceNames || !Array.isArray(resourceNames)) {
        await logError(supabaseClient, userId, 'Invalid response format from Google Ads API', 'google_ads_accounts')
        throw new Error('Invalid response format from Google Ads API')
      }

      console.log('Resource names retrieved:', resourceNames)

      // Buscar detalhes de todas as contas acessíveis
      const accounts: GoogleAdsAccount[] = []
      
      for (const resourceName of resourceNames) {
        const customerId = resourceName.split('/').pop()
        if (!customerId) continue

        console.log(`Fetching details for account ${customerId}...`)
        
        try {
          const accountResponse = await fetch(
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
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.auto_tagging_enabled,
                    customer.test_account
                  FROM customer
                  WHERE customer.id = '${customerId}'
                `
              })
            }
          )

          if (accountResponse.ok) {
            const details = await accountResponse.json()
            const account = details.results?.[0]?.customer
            
            if (account) {
              console.log('Account details:', account)
              accounts.push({
                customerId: account.id,
                descriptiveName: account.descriptiveName || `Account ${account.id}`,
                currencyCode: account.currencyCode,
                timeZone: account.timeZone,
                autoTaggingEnabled: account.autoTaggingEnabled,
                isTestAccount: account.testAccount === true
              })
            }
          } else {
            const errorText = await accountResponse.text()
            await logError(supabaseClient, userId, {
              message: `Failed to fetch details for account ${customerId}`,
              details: errorText
            }, 'google_ads_accounts')
            console.error(`Failed to fetch details for account ${customerId}:`, errorText)
          }
        } catch (error) {
          await logError(supabaseClient, userId, {
            message: `Error processing account ${customerId}`,
            error: error
          }, 'google_ads_accounts')
          console.error(`Error fetching details for account ${customerId}:`, error)
        }
      }

      console.log('Final accounts list:', accounts)
      await logInfo(supabaseClient, userId, `Successfully fetched ${accounts.length} accounts`, 'google_ads_accounts', {
        accountCount: accounts.length,
        accounts: accounts
      })

      return new Response(
        JSON.stringify({ accounts }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (error) {
      await logError(supabaseClient, userId, {
        message: 'Error in main accounts fetch process',
        error: error
      }, 'google_ads_accounts')
      console.error('Error:', error.message)
      throw error
    }

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