import { useEffect, useState } from 'react';
import { supabase, Recebimento, Fornecedor, Retirada } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatCard from '../components/dashboard/StatCard';
import { AlertCircle, TrendingUp, Users, DollarSign, Package, PackageMinus } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

interface DashboardStats {
  totalRecebimentos: number;
  valorTotal: number;
  fornecedoresAtivos: number;
  itensEstoqueBaixo: number;
  totalRetiradas: number;
  retiradasPendentes: number;
}

interface RecebimentoRecente extends Recebimento {
  fornecedor_nome?: string;
}

export function PainelGeral() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecebimentos: 0,
    valorTotal: 0,
    fornecedoresAtivos: 0,
    itensEstoqueBaixo: 0,
    totalRetiradas: 0,
    retiradasPendentes: 0,
  });
  const [recebimentosRecentes, setRecebimentosRecentes] = useState<RecebimentoRecente[]>([]);
  const [retiradasRecentes, setRetiradasRecentes] = useState<Retirada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Subscrição em tempo real
    const recebimentoChannel = supabase
      .channel('recebimento-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'recebimento' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const retiradasChannel = supabase
      .channel('retiradas-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'retiradas' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recebimentoChannel);
      supabase.removeChannel(retiradasChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar recebimentos
      const { data: recebimentos, error: recError } = await supabase
        .from('recebimento')
        .select('*')
        .order('created_at', { ascending: false });

      if (recError) throw recError;

      // Buscar fornecedores
      const { data: fornecedores, error: fornError } = await supabase
        .from('fornecedor')
        .select('*');

      if (fornError) throw fornError;

      // Buscar retiradas
      const { data: retiradas, error: retError } = await supabase
        .from('retiradas')
        .select('*')
        .order('created_at', { ascending: false });

      if (retError) throw retError;

      // Calcular estatísticas
      const valorTotal = recebimentos?.reduce((sum, rec) => sum + (rec.valor_total || 0), 0) || 0;
      const fornecedoresAtivos = new Set(recebimentos?.map(r => r.fornecedor)).size;
      const retiradasPendentes = retiradas?.filter(r => r.status_da_retirada?.toLowerCase() === 'pendente').length || 0;

      // Recebimentos recentes (últimos 5)
      const recentesRecebimentos = recebimentos?.slice(0, 5) || [];
      
      // Retiradas recentes (últimas 5)
      const recentesRetiradas = retiradas?.slice(0, 5) || [];

      setStats({
        totalRecebimentos: recebimentos?.length || 0,
        valorTotal,
        fornecedoresAtivos,
        itensEstoqueBaixo: 3, // Implementar lógica real baseada em limites
        totalRetiradas: retiradas?.length || 0,
        retiradasPendentes,
      });

      setRecebimentosRecentes(recentesRecebimentos);
      setRetiradasRecentes(recentesRetiradas);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-white">Painel Geral</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white">Painel Geral</h1>
        <p className="text-white/70">Visão geral do estoque e movimentações</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Total de Recebimentos</CardTitle>
            <Package className="w-5 h-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{stats.totalRecebimentos}</div>
            <p className="text-white/60">Registros totais</p>
          </CardContent>
        </Card>

        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Valor Total</CardTitle>
            <DollarSign className="w-5 h-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{formatCurrency(stats.valorTotal)}</div>
            <p className="text-white/60">Movimentado</p>
          </CardContent>
        </Card>

        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Fornecedores Ativos</CardTitle>
            <Users className="w-5 h-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{stats.fornecedoresAtivos}</div>
            <p className="text-white/60">Fornecedores únicos</p>
          </CardContent>
        </Card>

        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Total de Retiradas</CardTitle>
            <PackageMinus className="w-5 h-5 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{stats.totalRetiradas}</div>
            <p className="text-white/60">Retiradas registradas</p>
          </CardContent>
        </Card>

        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20 border-yellow-400/30"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Retiradas Pendentes</CardTitle>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{stats.retiradasPendentes}</div>
            <p className="text-yellow-400/80">Aguardando processamento</p>
          </CardContent>
        </Card>

        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20 border-red-400/30"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-white/80">Alertas de Estoque</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-white">{stats.itensEstoqueBaixo}</div>
            <p className="text-red-400/80">Itens com estoque baixo</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Movimentações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recebimentos Recentes */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Recebimentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recebimentosRecentes.length === 0 ? (
                <p className="text-white/60 text-center py-8">Nenhum recebimento encontrado</p>
              ) : (
                recebimentosRecentes.map((rec, index) => (
                  <div
                    key={rec.id || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-white">{rec.item}</p>
                        <Badge variant="outline" className="border-white/20 text-white/70">
                          NF: {rec.nota_fiscal}
                        </Badge>
                      </div>
                      <p className="text-white/60">
                        Fornecedor: {rec.fornecedor} | Qtd: {rec.qtde}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{formatCurrency(rec.valor_total)}</p>
                      <p className="text-white/60">{rec.data_lanc ? formatDate(rec.data_lanc) : 'N/A'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Retiradas Recentes */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Retiradas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retiradasRecentes.length === 0 ? (
                <p className="text-white/60 text-center py-8">Nenhuma retirada encontrada</p>
              ) : (
                retiradasRecentes.map((ret, index) => (
                  <div
                    key={ret.id || index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-white">{ret.numero_retirada}</p>
                        <Badge 
                          variant="outline" 
                          className={
                            ret.status?.toLowerCase() === 'concluído' 
                              ? 'border-green-400/30 text-green-400' 
                              : ret.status?.toLowerCase() === 'pendente'
                              ? 'border-yellow-400/30 text-yellow-400'
                              : 'border-white/20 text-white/70'
                          }
                        >
                          {ret.status}
                        </Badge>
                      </div>
                      <p className="text-white/60">
                        Solicitante: {ret.solicitante} | Setor: {ret.setor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60">{ret.data_retirada ? formatDate(ret.data_retirada) : 'N/A'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
