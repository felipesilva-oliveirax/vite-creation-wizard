import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bem-vindo</h1>
          <p className="text-sm text-muted-foreground">Faça login para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                }
              }
            }
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/dashboard`}
          queryParams={{
            access_type: 'offline',
            prompt: 'consent',
            scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts'
          }}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: "Continuar com {{provider}}"
              }
            }
          }}
          view="sign_in"
          showLinks={false}
          onlyThirdPartyProviders={true}
        />
      </div>
    </div>
  );
};

export default Login;