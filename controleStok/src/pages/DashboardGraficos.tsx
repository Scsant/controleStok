import { useEffect, useState } from 'react';
import { supabase, Recebimento, Retirada } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '../components/ui/skeleton';

interface MonthlyData {
  mes: string;
  total: number;
  valor: number;
  retiradas?: number;
}

interface FornecedorData {
  nome: string;
  quantidade: number;
  valor: number;
}

interface SetorData {
  setor: string;
  quantidade: number;
}

interface StatusData {
  status: string;
  quantidade: number;
}

export function DashboardGraficos() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [fornecedorData, setFornecedorData] = useState<FornecedorData[]>([]);
  const [setorData, setSetorData] = useState<SetorData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchChartData, 30000);

    // Subscrição em tempo real
    const recebimentoChannel = supabase
      .channel('recebimento-graficos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recebimento' },
        () => {
          fetchChartData();
        }
      )
      .subscribe();

    const retiradasChannel = supabase
      .channel('retiradas-graficos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'retiradas' },
        () => {
          fetchChartData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(recebimentoChannel);
      supabase.removeChannel(retiradasChannel);
    };
  }, []);

  const fetchChartData = async () => {
    try {
      const { data: recebimentos, error } = await supabase
        .from('recebimento')
        .select('*');

      if (error) throw error;

      // Buscar retiradas
      const { data: retiradas, error: retError } = await supabase
        .from('retiradas')
        .select('*');

      if (retError) throw retError;

      // Processar dados mensais (recebimentos + retiradas)
      const monthlyMap = new Map<string, { total: number; valor: number; retiradas: number }>();
      
      recebimentos?.forEach((rec) => {
        if (rec.data_lanc) {
          const date = new Date(rec.data_lanc);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          const existing = monthlyMap.get(monthKey) || { total: 0, valor: 0, retiradas: 0 };
          monthlyMap.set(monthKey, {
            total: existing.total + 1,
            valor: existing.valor + (rec.valor_total || 0),
            retiradas: existing.retiradas,
          });
        }
      });

      retiradas?.forEach((ret) => {
        if (ret.data) {
          const date = new Date(ret.data);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          const existing = monthlyMap.get(monthKey) || { total: 0, valor: 0, retiradas: 0 };
          monthlyMap.set(monthKey, {
            total: existing.total,
            valor: existing.valor,
            retiradas: existing.retiradas + 1,
          });
        }
      });

      const monthly = Array.from(monthlyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([key, value]) => {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            mes: date.toLocaleDateString('pt-BR', { month: 'short' }),
            total: value.total,
            valor: value.valor,
            retiradas: value.retiradas,
          };
        });

      setMonthlyData(monthly);

      // Processar dados por fornecedor
      const fornecedorMap = new Map<string, { quantidade: number; valor: number }>();
      
      recebimentos?.forEach((rec) => {
        const fornecedor = rec.fornecedor || 'Não identificado';
        const existing = fornecedorMap.get(fornecedor) || { quantidade: 0, valor: 0 };
        fornecedorMap.set(fornecedor, {
          quantidade: existing.quantidade + (rec.qtde || 0),
          valor: existing.valor + (rec.valor_total || 0),
        });
      });

      const fornecedores = Array.from(fornecedorMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          valor: data.valor,
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      setFornecedorData(fornecedores);

      // Processar dados por regional (retiradas)
      const regionalMap = new Map<string, number>();
      
      retiradas?.forEach((ret) => {
        const regional = ret.regional || 'Não identificado';
        regionalMap.set(regional, (regionalMap.get(regional) || 0) + 1);
      });

      const regionais = Array.from(regionalMap.entries())
        .map(([setor, quantidade]) => ({ setor, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);

      setSetorData(regionais);

      // Processar dados por status (retiradas)
      const statusMap = new Map<string, number>();
      
      retiradas?.forEach((ret) => {
        const status = ret.status_da_retirada || 'Sem status';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statuses = Array.from(statusMap.entries())
        .map(([status, quantidade]) => ({ status, quantidade }));

      setStatusData(statuses);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatName = (name: string) => {
    if (!name) return '';
    return name.length > 28 ? `${name.slice(0, 25)}...` : name;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-white">Dashboard de Gráficos</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white">Dashboard de Gráficos</h1>
        <p className="text-white/70">Análise visual dos dados de estoque</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Recebimentos */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Evolução de Recebimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="mes" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Recebimentos"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retiradas" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Retiradas"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Valor Total Movimentado */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Valor Total Movimentado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="mes" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '0.5rem',
                    color: '#111',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar 
                  dataKey="valor" 
                  fill="#8b5cf6" 
                  name="Valor Total"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Fornecedores por Valor */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Top Fornecedores por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fornecedorData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props) => {
                    // custom label renderer: place label outside and show percent when relevant
                    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props as any;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    // hide labels for very small slices
                    if (percent <= 0.03) return null;
                    const entry = fornecedorData[index];
                    return (
                      // eslint-disable-next-line react/no-unknown-property
                      <text x={x} y={y} fill={"var(--chart-label-color)"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${entry.nome} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {fornecedorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--chart-tooltip-color)',
                    boxShadow: 'var(--chart-tooltip-boxshadow)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* legenda customizada: lista abaixo do gráfico para evitar sobreposição */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fornecedorData.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div className="text-sm">
                    <div className="font-medium text-white">{f.nome}</div>
                    <div className="text-white/70">{formatCurrency(f.valor)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Fornecedores */}
        <Card 
          className="backdrop-blur-md bg-white/15 border-white/20"
          style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <CardHeader>
            <CardTitle className="text-white">Volume por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fornecedorData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis 
                  type="number" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.8)' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: '#fff', fontSize: 12, dy: -2 }}
                  width={220}
                  interval={0}
                  tickFormatter={(name: string) => formatName(name)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar 
                  dataKey="quantidade" 
                  fill="#06b6d4" 
                  name="Quantidade"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status de Retiradas */}
      <Card 
        className="backdrop-blur-md bg-white/15 border-white/20"
        style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        <CardHeader>
          <CardTitle className="text-white">Status de Retiradas</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(props) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props as any;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  if (percent <= 0.03) return null;
                  const entry = statusData[index];
                  return (
                    <text x={x} y={y} fill={"var(--chart-label-color)"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                      {`${entry.status} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-tooltip-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--chart-tooltip-color)',
                  boxShadow: 'var(--chart-tooltip-boxshadow)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Retiradas por Regional */}
      <Card 
        className="backdrop-blur-md bg-white/15 border-white/20"
        style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        <CardHeader>
          <CardTitle className="text-white">Retiradas por Regional</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={setorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="setor" 
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.8)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.8)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.5rem',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar 
                dataKey="quantidade" 
                fill="#f59e0b" 
                name="Quantidade"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Resumo de Fornecedores */}
      <Card 
        className="backdrop-blur-md bg-white/15 border-white/20"
        style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        <CardHeader>
          <CardTitle className="text-white">Resumo de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fornecedorData.map((fornecedor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                style={{ borderRadius: '0.75rem' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-white">{fornecedor.nome}</p>
                    <p className="text-white/60">Quantidade: {fornecedor.quantidade}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatCurrency(fornecedor.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
