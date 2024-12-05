import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTestMode } from "@/contexts/TestModeContext";
import { Loader2 } from "lucide-react";

interface UserData {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface GoogleAdsAccount {
  customerId: string;
  descriptiveName: string;
  isTestAccount?: boolean;
}

export function UserNav() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({});
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isTestMode, setIsTestMode } = useTestMode();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setUserData({
          full_name: user.user_metadata.full_name,
          email: user.email,
          avatar_url: user.user_metadata.avatar_url
        });
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function loadAccounts() {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const response = await supabase.functions.invoke('google-ads-accounts', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            test_mode: isTestMode
          }
        });

        if (response.data?.accounts) {
          setAccounts(response.data.accounts);
          setSelectedAccount(null);
          if (window.location.pathname.includes('/campaigns/')) {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, [isTestMode, navigate]);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    navigate(`/campaigns/${accountId}`);
  };

  const handleTestModeToggle = () => {
    setIsTestMode(!isTestMode);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.avatar_url} alt={userData.full_name} />
            <AvatarFallback>{userData.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="px-2 py-2 flex items-center justify-between">
            <span className="text-sm">{!isTestMode ? 'Modo Produção' : 'Modo Teste'}</span>
            <Switch
              checked={!isTestMode}
              onCheckedChange={() => handleTestModeToggle()}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-yellow-500"
            />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Contas Google Ads</DropdownMenuLabel>
          {isLoading ? (
            <DropdownMenuItem disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando contas...</span>
              </div>
            </DropdownMenuItem>
          ) : (
            <>
              {accounts.map((account) => (
                <DropdownMenuItem 
                  key={account.customerId}
                  onClick={() => handleAccountSelect(account.customerId)}
                  className={`${selectedAccount === account.customerId ? "bg-accent" : ""} cursor-pointer`}
                >
                  <div className="flex flex-col">
                    <span>{account.descriptiveName}</span>
                    <span className="text-xs text-muted-foreground">
                      {account.customerId}
                      {account.isTestAccount && " (Teste)"}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              {accounts.length === 0 && (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-muted-foreground">
                    {isTestMode ? "Nenhuma conta de teste disponível" : "Nenhuma conta disponível"}
                  </span>
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}