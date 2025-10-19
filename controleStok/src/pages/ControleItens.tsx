import { useEffect, useState } from 'react';
import { supabase, Recebimento } from '../lib/supabase';
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
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export function ControleItens() {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [filteredRecebimentos, setFilteredRecebimentos] = useState<Recebimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Recebimento>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Recebimento>>({
    pedido: '',
    cod_sap: '',
    item: '',
    qtde: 0,
    valor_unit: 0,
    valor_total: 0,
    fornecedor: '',
    nota_fiscal: '',
    data_lanc: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchRecebimentos();

    // Subscrição em tempo real
    const channel = supabase
      .channel('recebimentos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recebimento' },
        () => {
          fetchRecebimentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = recebimentos.filter(rec =>
      rec.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.cod_sap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nota_fiscal?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecebimentos(filtered);
    setCurrentPage(1); // reset page when filter changes
  }, [searchTerm, recebimentos]);

  const fetchRecebimentos = async () => {
    try {
      const { data, error } = await supabase
        .from('recebimento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecebimentos(data || []);
      setFilteredRecebimentos(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar recebimentos:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const { error } = await supabase
        .from('recebimento')
        .insert([newItem]);

      if (error) throw error;

      toast.success('Item adicionado com sucesso!');
      setDialogOpen(false);
      setNewItem({
        pedido: '',
        cod_sap: '',
        item: '',
        qtde: 0,
        valor_unit: 0,
        valor_total: 0,
        fornecedor: '',
        nota_fiscal: '',
        data_lanc: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const handleEdit = (rec: Recebimento) => {
    setEditingId(rec.id!);
    setEditData(rec);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const { error } = await supabase
        .from('recebimento')
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
        .from('recebimento')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-white">Controle de Itens</h1>
          <p className="text-white/70">Gerencie recebimentos e materiais</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-purple-900 hover:bg-white/90"
              style={{ borderRadius: '1rem' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="backdrop-blur-md bg-purple-950/95 border-white/20 text-white max-w-2xl"
            style={{ borderRadius: '1rem' }}
          >
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Recebimento</DialogTitle>
              <DialogDescription className="text-white/70">
                Preencha os dados do novo recebimento
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pedido" className="text-white">Pedido</Label>
                <Input
                  id="pedido"
                  value={newItem.pedido}
                  onChange={(e) => setNewItem({ ...newItem, pedido: e.target.value })}
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
                <Label htmlFor="item" className="text-white">Item/Descrição</Label>
                <Input
                  id="item"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtde" className="text-white">Quantidade</Label>
                <Input
                  id="qtde"
                  type="number"
                  value={newItem.qtde}
                  onChange={(e) => setNewItem({ ...newItem, qtde: parseFloat(e.target.value) })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_unit" className="text-white">Valor Unitário</Label>
                <Input
                  id="valor_unit"
                  type="number"
                  step="0.01"
                  value={newItem.valor_unit}
                  onChange={(e) => {
                    const valorUnit = parseFloat(e.target.value);
                    setNewItem({ 
                      ...newItem, 
                      valor_unit: valorUnit,
                      valor_total: valorUnit * (newItem.qtde || 0)
                    });
                  }}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="text-white">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={newItem.fornecedor}
                  onChange={(e) => setNewItem({ ...newItem, fornecedor: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nota_fiscal" className="text-white">Nota Fiscal</Label>
                <Input
                  id="nota_fiscal"
                  value={newItem.nota_fiscal}
                  onChange={(e) => setNewItem({ ...newItem, nota_fiscal: e.target.value })}
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
              placeholder="Buscar por item, código SAP, fornecedor ou nota fiscal..."
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
            Recebimentos ({filteredRecebimentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/80">Pedido</TableHead>
                  <TableHead className="text-white/80">Cód. SAP</TableHead>
                  <TableHead className="text-white/80">Item</TableHead>
                  <TableHead className="text-white/80">Qtd</TableHead>
                  <TableHead className="text-white/80">Valor Unit.</TableHead>
                  <TableHead className="text-white/80">Valor Total</TableHead>
                  <TableHead className="text-white/80">Fornecedor</TableHead>
                  <TableHead className="text-white/80">NF</TableHead>
                  <TableHead className="text-white/80 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecebimentos.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((rec) => (
                  <TableRow key={rec.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white">
                      {editingId === rec.id ? (
                        <Input
                          value={editData.pedido}
                          onChange={(e) => setEditData({ ...editData, pedido: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        rec.pedido
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === rec.id ? (
                        <Input
                          value={editData.cod_sap}
                          onChange={(e) => setEditData({ ...editData, cod_sap: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        rec.cod_sap
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === rec.id ? (
                        <Input
                          value={editData.item}
                          onChange={(e) => setEditData({ ...editData, item: e.target.value })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      ) : (
                        rec.item
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === rec.id ? (
                        <Input
                          type="number"
                          value={editData.qtde}
                          onChange={(e) => setEditData({ ...editData, qtde: parseFloat(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8 w-20"
                        />
                      ) : (
                        rec.qtde
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === rec.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.valor_unit}
                          onChange={(e) => setEditData({ ...editData, valor_unit: parseFloat(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8 w-24"
                        />
                      ) : (
                        formatCurrency(rec.valor_unit)
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {formatCurrency(rec.valor_total)}
                    </TableCell>
                    <TableCell className="text-white">{rec.fornecedor}</TableCell>
                    <TableCell className="text-white">
                      <Badge variant="outline" className="border-white/20 text-white/70">
                        {rec.nota_fiscal}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === rec.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSaveEdit(rec.id!)}
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
                            onClick={() => handleEdit(rec)}
                            className="h-8 w-8 text-white/70 hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(rec.id!)}
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

          {/* Pagination controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <label className="text-white/80">Itens por página:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-white/10 border-white/20 text-white p-1 rounded"
                aria-label="Itens por página"
              >
                {[5,10,20,50].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-40"
                aria-label="Página anterior"
              >Anterior</button>
              <span className="text-white/70">Página {currentPage} de {Math.max(1, Math.ceil(filteredRecebimentos.length / pageSize))}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRecebimentos.length / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(filteredRecebimentos.length / pageSize)}
                className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-40"
                aria-label="Próxima página"
              >Próxima</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
