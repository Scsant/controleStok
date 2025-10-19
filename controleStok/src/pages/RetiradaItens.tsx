import { useEffect, useState } from 'react';
import { supabase, RetiradaItem } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function RetiradaItens() {
  const [itens, setItens] = useState<RetiradaItem[]>([]);
  const [filteredItens, setFilteredItens] = useState<RetiradaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<RetiradaItem>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RetiradaItem>>({
    data: new Date().toISOString().slice(0,10),
    mes: new Date().toLocaleDateString('pt-BR', { month: 'short' }),
    dia_da_semana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
    status_da_retirada: 'Pendente',
    empresa: 'Bracell',
    cod_sap: '',
    item: '',
    quantidade: 1,
  // unidade_medida removed; using entregue_por instead
    valor_unitario: '0',
    valor_total: '0',
    local: 'Logística',
    regional: '',
    fazenda: '',
    modulo: '',
    solicitante: '',
    entregue_por: '',
    retirado_por: '',
  });

  useEffect(() => {
    fetchItens();

    const channel = supabase
      .channel('retirada-itens-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'retirada_itens' },
        () => {
          fetchItens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = itens.filter(item =>
      item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cod_sap?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItens(filtered);
  }, [searchTerm, itens]);

  const fetchItens = async () => {
    try {
      const { data, error } = await supabase
        .from('retirada_itens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItens(data || []);
      setFilteredItens(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    // Validation: ensure minimal fields
    const codSap = (newItem.cod_sap || '').toString().trim();
    const descricaoItem = (newItem.item || '').toString().trim();
    const quantidade = Number(newItem.quantidade || 0);

    if (!codSap && !descricaoItem) {
      toast.error('Informe o Código SAP ou a descrição do item.');
      return;
    }

    if (!quantidade || quantidade <= 0) {
      toast.error('Informe uma quantidade maior que zero.');
      return;
    }

    try {
      const payload: Partial<RetiradaItem> = {
        data: newItem.data,
        mes: newItem.mes,
        dia_da_semana: newItem.dia_da_semana,
        status_da_retirada: newItem.status_da_retirada,
        empresa: newItem.empresa,
        cod_sap: codSap || undefined,
        item: descricaoItem || undefined,
        quantidade: quantidade,
  // unidade_medida removed; entregue_por used below
        valor_unitario: newItem.valor_unitario,
        valor_total: newItem.valor_total,
        local: newItem.local || 'Logística',
        regional: newItem.regional,
        fazenda: newItem.fazenda,
        modulo: newItem.modulo,
        solicitante: newItem.solicitante,
        entregue_por: newItem.entregue_por,
        retirado_por: newItem.retirado_por,
      };

      const { error } = await supabase
        .from('retirada_itens')
        .insert([payload]);

      if (error) throw error;

      toast.success('Item adicionado com sucesso!');
      setDialogOpen(false);
      // reset to defaults
      setNewItem({
        data: new Date().toISOString().slice(0,10),
        mes: new Date().toLocaleDateString('pt-BR', { month: 'short' }),
        dia_da_semana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
        status_da_retirada: 'Pendente',
        empresa: 'Bracell',
        cod_sap: '',
        item: '',
        quantidade: 1,
        valor_unitario: '0',
        valor_total: '0',
        local: 'Logística',
        regional: '',
        fazenda: '',
        modulo: '',
        solicitante: '',
        entregue_por: '',
        retirado_por: '',
      });

      // refresh list
      await fetchItens();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const handleEdit = (item: RetiradaItem) => {
    setEditingId(item.id!);
    setEditData(item);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const { error } = await supabase
        .from('retirada_itens')
        .update(editData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Item atualizado com sucesso!');
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('retirada_itens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-white">Itens de Retirada</h1>
          <p className="text-white/70">Gerencie os itens das retiradas</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-purple-900 hover:bg-white/90"
              style={{ borderRadius: '1rem' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="backdrop-blur-md bg-purple-950/95 border-white/20 text-white max-w-2xl"
            style={{ borderRadius: '1rem' }}
          >
            <DialogHeader>
              <DialogTitle className="text-white">Novo Item de Retirada</DialogTitle>
              <DialogDescription className="text-white/70">
                Preencha os dados do novo item
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-white">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={newItem.data}
                  onChange={(e) => setNewItem({ ...newItem, data: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cod_sap" className="text-white">Código SAP</Label>
                <Input
                  id="cod_sap"
                  value={newItem.cod_sap}
                  onChange={(e) => setNewItem({ ...newItem, cod_sap: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="item" className="text-white">Descrição</Label>
                <Input
                  id="item"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidade" className="text-white">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({ ...newItem, quantidade: parseFloat(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entregue_por" className="text-white">Entregue por</Label>
                <Input
                  id="entregue_por"
                  value={newItem.entregue_por}
                  onChange={(e) => setNewItem({ ...newItem, entregue_por: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="local" className="text-white">Local</Label>
                <Input
                  id="local"
                  value={newItem.local}
                  onChange={(e) => setNewItem({ ...newItem, local: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddItem}
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
              placeholder="Buscar por descrição ou código SAP..."
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
            Itens de Retirada ({filteredItens.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/80">ID</TableHead>
                  <TableHead className="text-white/80">Cód. SAP</TableHead>
                  <TableHead className="text-white/80">Descrição</TableHead>
                  <TableHead className="text-white/80">Quantidade</TableHead>
                  <TableHead className="text-white/80">Entregue por</TableHead>
                  <TableHead className="text-white/80">Local</TableHead>
                  <TableHead className="text-white/80 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItens.map((item) => (
                  <TableRow key={item.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white">{item.id || item.data || '-'}</TableCell>
                    <TableCell className="text-white">
                      {editingId === item.id ? (
                        <Input
                          value={(editData as any).cod_sap}
                          onChange={(e) => setEditData({ ...editData, cod_sap: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        item.cod_sap
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === item.id ? (
                        <Input
                          value={(editData as any).item}
                          onChange={(e) => setEditData({ ...editData, item: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        item.item
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={(editData as any).quantidade}
                          onChange={(e) => setEditData({ ...editData, quantidade: parseFloat(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8 w-20"
                        />
                      ) : (
                        item.quantidade
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === item.id ? (
                        <Input
                          value={(editData as any).entregue_por}
                          onChange={(e) => setEditData({ ...editData, entregue_por: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        item.entregue_por || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-white/70 max-w-xs truncate">
                      {item.local || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSaveEdit(item.id!)}
                            className="h-8 w-8 text-green-400 hover:bg-green-400/20"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 text-red-400 hover:bg-red-400/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8 text-white/70 hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id!)}
                            className="h-8 w-8 text-red-400 hover:bg-red-400/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
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
