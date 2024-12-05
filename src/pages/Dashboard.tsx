import { TopNav } from "@/components/layout/top-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTestMode } from "@/contexts/TestModeContext";
import { Loader2 } from "lucide-react";

interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  isTestAccount: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isTestMode } = useTestMode();
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para ver suas contas.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-ads-accounts', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          test_mode: isTestMode
        }
      });

      if (error) {
        console.error('Error fetching accounts:', error);
        toast({
          title: "Erro ao buscar contas",
          description: "Não foi possível carregar suas contas do Google Ads.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar suas contas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [navigate, toast, isTestMode]);

  const handleAccountSelect = (accountId: string) => {
    navigate(`/campaigns/${accountId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto p-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Selecione uma conta Google Ads</h1>
          </div>
          <Select onValueChange={handleAccountSelect} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading 
                  ? "Carregando contas..." 
                  : isTestMode 
                    ? "Selecione uma conta de teste" 
                    : "Selecione uma conta"
              } />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Carregando contas...</span>
                </div>
              ) : (
                <>
                  {accounts.map((account) => (
                    <SelectItem key={account.customerId} value={account.customerId}>
                      {account.descriptiveName} - ({account.customerId})
                      {account.isTestAccount && " (Teste)"}
                    </SelectItem>
                  ))}
                  {accounts.length === 0 && (
                    <SelectItem value="" disabled>
                      {isTestMode 
                        ? "Nenhuma conta de teste encontrada. Tente mudar para o modo normal."
                        : "Nenhuma conta encontrada. Tente mudar para o modo teste."}
                    </SelectItem>
                  )}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </main>
    </div>
  );
}