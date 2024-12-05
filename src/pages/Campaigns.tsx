import { TopNav } from "@/components/layout/top-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  budget: number;
  status: string;
}

export default function Campaigns() {
  const { accountId } = useParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const itemsPerPage = 10;

  useEffect(() => {
    async function loadCampaigns() {
      if (!accountId) return;
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para ver suas campanhas.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await supabase.functions.invoke('google-ads-campaigns', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            customer_id: accountId
          }
        });

        if (response.error) {
          toast({
            title: "Erro ao carregar campanhas",
            description: response.error.message,
            variant: "destructive",
          });
          return;
        }

        if (response.data?.campaigns) {
          setCampaigns(response.data.campaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            budget: campaign.budget,
            status: campaign.status,
          })));
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar as campanhas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, [accountId, toast]);

  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCampaigns = campaigns.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
      enabled: { variant: "default", label: "Ativo" },
      paused: { variant: "secondary", label: "Pausado" },
      removed: { variant: "destructive", label: "Removido" },
    };

    const statusInfo = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Campanhas</h1>
          {isLoading && <Loader2 className="animate-spin" />}
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" />
                      Carregando campanhas...
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhuma campanha encontrada
                  </TableCell>
                </TableRow>
              ) : (
                displayedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>R$ {campaign.budget.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && campaigns.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <PaginationPrevious className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button 
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <PaginationNext className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}