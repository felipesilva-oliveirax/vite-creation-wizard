import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const hash = url.hash

    // Extrair access token do hash da URL
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')

    if (!accessToken) {
      throw new Error('No access token found')
    }

    // Inicializar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    // Obter o usuário
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(accessToken)

    if (userError || !user) {
      throw new Error('Error getting user')
    }

    // Extrair tokens do hash da URL
    const providerToken = params.get('provider_token')
    const providerRefreshToken = params.get('provider_refresh_token')

    if (!providerToken || !providerRefreshToken) {
      throw new Error('Missing provider tokens')
    }

    console.log('Provider tokens retrieved:', {
      hasProviderToken: !!providerToken,
      hasProviderRefreshToken: !!providerRefreshToken
    })

    // Atualizar tokens na tabela usuarios
    const { error: updateError } = await supabaseClient
      .from('usuarios')
      .update({
        google_ads_token: providerToken,
        google_ads_refresh_token: providerRefreshToken
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating tokens:', updateError)
      throw new Error('Error updating tokens')
    }

    // Redirecionar para o dashboard com uma mensagem de sucesso
    const dashboardUrl = new URL('/dashboard', url.origin)
    dashboardUrl.searchParams.set('status', 'success')
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': dashboardUrl.toString()
      }
    })

  } catch (error) {
    console.error('Error:', error)
    // Redirecionar para o dashboard com uma mensagem de erro
    const errorUrl = new URL('/dashboard', new URL(req.url).origin)
    errorUrl.searchParams.set('status', 'error')
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': errorUrl.toString()
      }
    })
  }
})