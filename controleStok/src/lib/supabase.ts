import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - Bracell Logística
// Prefer environment variables (Vite exposes VITE_ prefixed vars to the client).
const FALLBACK_SUPABASE_URL = 'https://tfsznntgfxgxwlvyxsjc.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3pubnRnZnhneHdsdnl4c2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjg3MDMsImV4cCI6MjA3NTk0NDcwM30.QFyTSPp4ZSRQD6idcWwG1qbIWuSlM1u7tAv_OWs8ync';

const supabaseUrl = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Fornecedor {
  id: number;
  cod_sap: string;
  dados_fornecedor: string;
  created_at?: string;
}

export interface Item {
  id: number;
  cod_sap: string;
  descricao: string;
  unidade: string;
  created_at?: string;
}

export interface Recebimento {
  id?: number;
  pedido: string;
  cod_sap: string;
  item: string;
  qtde: number;
  valor_unit: number;
  valor_total: number;
  fornecedor: string;
  nota_fiscal: string;
  statis?: string;
  miro?: string;
  data_lanc: string;
  created_at?: string;
  updated_at?: string;
}

export interface Valor {
  id?: number;
  cod_sap: string;
  descricao_item: string;
  valor: number;
  fornecedor_id: number;
  created_at?: string;
}

export interface Retirada {
  id?: number;
  data: string;
  mes: string;
  dia_da_semana: string;
  status_da_retirada: string;
  empresa: string;
  local: string;
  solicitante?: string;
  entregue_por?: string;
  retirado_por?: string;
  fazenda?: string;
  modulo?: string;
  regional?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RetiradaItem {
  id?: number;
  data: string;
  mes: string;
  dia_da_semana: string;
  status_da_retirada: string;
  empresa: string;
  cod_sap?: string;
  item?: string; // descrição do item
  quantidade?: number;
  unidade_medida?: string;
  valor_unitario?: string;
  valor_total?: string;
  local: string;
  solicitante?: string;
  entregue_por?: string;
  retirado_por?: string;
  fazenda?: string;
  modulo?: string;
  regional?: string;
  created_at?: string;
  updated_at?: string;
}
