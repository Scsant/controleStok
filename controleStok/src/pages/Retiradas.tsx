import { useEffect, useState } from 'react';
import { supabase, Retirada } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../components/ui/badge';

export function Retiradas() {
  const [retiradas, setRetiradas] = useState<Retirada[]>([]);
  const [filteredRetiradas, setFilteredRetiradas] = useState<Retirada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Retirada>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const getDefaultDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDiaDaSemana = (dateString: string) => {
    const date = new Date(dateString);
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[date.getDay()];
  };

  const getMes = (dateString: string) => {
    const date = new Date(dateString);
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[date.getMonth()];
  };

  const [newRetirada, setNewRetirada] = useState<Partial<Retirada>>({
    data: getDefaultDate(),
    mes: getMes(getDefaultDate()),
    dia_da_semana: getDiaDaSemana(getDefaultDate()),
    status_da_retirada: 'Pendente',
    empresa: '',
    local: '',
    solicitante: '',
    entregue_por: '',
    retirado_por: '',
    fazenda: '',
    modulo: '',
    regional: '',
  });

  useEffect(() => {
    fetchRetiradas();

    const channel = supabase
      .channel('retiradas-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'retiradas' },
        () => {
          fetchRetiradas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = retiradas.filter(ret =>
      ret.solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.regional?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.fazenda?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRetiradas(filtered);
  }, [searchTerm, retiradas]);

  const fetchRetiradas = async () => {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRetiradas(data || []);
      setFilteredRetiradas(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar retiradas:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleAddRetirada = async () => {
    try {
      const { error } = await supabase
        .from('retiradas')
        .insert([newRetirada]);

      if (error) throw error;

      toast.success('Retirada adicionada com sucesso!');
      setDialogOpen(false);
      setNewRetirada({
        data: getDefaultDate(),
        mes: getMes(getDefaultDate()),
        dia_da_semana: getDiaDaSemana(getDefaultDate()),
        status_da_retirada: 'Pendente',
        empresa: '',
        local: '',
        solicitante: '',
        entregue_por: '',
        retirado_por: '',
        fazenda: '',
        modulo: '',
        regional: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar retirada:', error);
      toast.error('Erro ao adicionar retirada');
    }
  };

  const handleEdit = (ret: Retirada) => {
    setEditingId(ret.id!);
    setEditData(ret);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const { error } = await supabase
        .from('retiradas')
        .update(editData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Retirada atualizada com sucesso!');
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Erro ao atualizar retirada:', error);
      toast.error('Erro ao atualizar retirada');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta retirada?')) return;

    try {
      const { error } = await supabase
        .from('retiradas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Retirada excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir retirada:', error);
      toast.error('Erro ao excluir retirada');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'concluído':
      case 'concluido':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'em andamento':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'pendente':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleDateChange = (dateString: string) => {
    setNewRetirada({
      ...newRetirada,
      data: dateString,
      mes: getMes(dateString),
      dia_da_semana: getDiaDaSemana(dateString),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-white">Controle de Retiradas</h1>
          <p className="text-white/70">Gerencie retiradas de materiais</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-purple-900 hover:bg-white/90"
              style={{ borderRadius: '1rem' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Retirada
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="backdrop-blur-md bg-purple-950/95 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{ borderRadius: '1rem' }}
          >
            <DialogHeader>
              <DialogTitle className="text-white">Nova Retirada</DialogTitle>
              <DialogDescription className="text-white/70">
                Preencha os dados da nova retirada
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-white">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={newRetirada.data}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select
                  value={newRetirada.status_da_retirada}
                  onValueChange={(value) => setNewRetirada({ ...newRetirada, status_da_retirada: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white" style={{ borderRadius: '1rem' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-white">Empresa</Label>
                <Input
                  id="empresa"
                  value={newRetirada.empresa}
                  onChange={(e) => setNewRetirada({ ...newRetirada, empresa: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="local" className="text-white">Local</Label>
                <Input
                  id="local"
                  value={newRetirada.local}
                  onChange={(e) => setNewRetirada({ ...newRetirada, local: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solicitante" className="text-white">Solicitante</Label>
                <Input
                  id="solicitante"
                  value={newRetirada.solicitante}
                  onChange={(e) => setNewRetirada({ ...newRetirada, solicitante: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entregue_por" className="text-white">Entregue Por</Label>
                <Input
                  id="entregue_por"
                  value={newRetirada.entregue_por}
                  onChange={(e) => setNewRetirada({ ...newRetirada, entregue_por: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retirado_por" className="text-white">Retirado Por</Label>
                <Input
                  id="retirado_por"
                  value={newRetirada.retirado_por}
                  onChange={(e) => setNewRetirada({ ...newRetirada, retirado_por: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fazenda" className="text-white">Fazenda</Label>
                <Input
                  id="fazenda"
                  value={newRetirada.fazenda}
                  onChange={(e) => setNewRetirada({ ...newRetirada, fazenda: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modulo" className="text-white">Módulo</Label>
                <Input
                  id="modulo"
                  value={newRetirada.modulo}
                  onChange={(e) => setNewRetirada({ ...newRetirada, modulo: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regional" className="text-white">Regional</Label>
                <Input
                  id="regional"
                  value={newRetirada.regional}
                  onChange={(e) => setNewRetirada({ ...newRetirada, regional: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddRetirada}
              className="w-full bg-white text-purple-900 hover:bg-white/90"
              style={{ borderRadius: '1rem' }}
            >
              Adicionar
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <Card 
        className="backdrop-blur-md bg-white/15 border-white/20"
        style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              placeholder="Buscar por solicitante, empresa, local, regional ou fazenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              style={{ borderRadius: '1rem' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card 
        className="backdrop-blur-md bg-white/15 border-white/20"
        style={{ borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
      >
        <CardHeader>
          <CardTitle className="text-white">
            Retiradas ({filteredRetiradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/80">Data</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                  <TableHead className="text-white/80">Empresa</TableHead>
                  <TableHead className="text-white/80">Local</TableHead>
                  <TableHead className="text-white/80">Solicitante</TableHead>
                  <TableHead className="text-white/80">Regional</TableHead>
                  <TableHead className="text-white/80">Fazenda</TableHead>
                  <TableHead className="text-white/80 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRetiradas.map((ret) => (
                  <TableRow key={ret.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white">
                      {ret.data ? formatDate(ret.data) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(ret.status_da_retirada)}>
                        {ret.status_da_retirada}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{ret.empresa}</TableCell>
                    <TableCell className="text-white">{ret.local}</TableCell>
                    <TableCell className="text-white">{ret.solicitante || '-'}</TableCell>
                    <TableCell className="text-white">{ret.regional || '-'}</TableCell>
                    <TableCell className="text-white">{ret.fazenda || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(ret)}
                          className="h-8 w-8 text-white/70 hover:bg-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(ret.id!)}
                          className="h-8 w-8 text-red-400 hover:bg-red-400/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
