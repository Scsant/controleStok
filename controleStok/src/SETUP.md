# 🚀 Guia de Setup Completo - Bracell Logística

## 📋 Passo a Passo para Subir no GitHub

### 1. Inicialize o Git (se ainda não foi feito)

```bash
git init
```

### 2. Adicione todos os arquivos

```bash
git add .
```

### 3. Faça o commit inicial

```bash
git commit -m "feat: Sistema completo de gestão de estoque Bracell"
```

### 4. Crie um repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome sugerido: `bracell-logistica-estoque`
4. Deixe como **Private** (dados da empresa)
5. **NÃO** inicialize com README
6. Clique em "Create repository"

### 5. Conecte ao repositório remoto

```bash
git remote add origin https://github.com/SEU-USUARIO/bracell-logistica-estoque.git
```

### 6. Envie o código

```bash
git branch -M main
git push -u origin main
```

## 🔒 Segurança - IMPORTANTE!

### ⚠️ NUNCA faça commit das credenciais do Supabase!

Antes de fazer o primeiro commit, crie um arquivo `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.production
node_modules/
dist/
.DS_Store
```

### Remover credenciais do código

Se você já commitou o arquivo com credenciais, você precisa:

1. Remover as credenciais hardcoded do arquivo `/lib/supabase.ts`
2. Usar variáveis de ambiente

Edite `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configurações do Supabase não encontradas. Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Crie o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://tfsznntgfxgxwlvyxsjc.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

## 📦 Scripts SQL para o Supabase

Execute estes scripts no **Supabase SQL Editor**:

### Script 1: Criar função de atualização automática

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Script 2: Tabela Fornecedor

```sql
CREATE TABLE IF NOT EXISTS public.fornecedor (
  id BIGSERIAL PRIMARY KEY,
  cod_sap TEXT NOT NULL,
  dados_fornecedor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_fornecedor_cod_sap ON public.fornecedor(cod_sap);
```

### Script 3: Tabela Itens

```sql
CREATE TABLE IF NOT EXISTS public.itens (
  id BIGSERIAL PRIMARY KEY,
  cod_sap TEXT NOT NULL,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_itens_cod_sap ON public.itens(cod_sap);
```

### Script 4: Tabela Recebimento

```sql
CREATE TABLE IF NOT EXISTS public.recebimento (
  id BIGSERIAL PRIMARY KEY,
  pedido TEXT NOT NULL,
  cod_sap TEXT NOT NULL,
  item TEXT NOT NULL,
  qtde NUMERIC NOT NULL,
  valor_unit NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  fornecedor TEXT NOT NULL,
  nota_fiscal TEXT NOT NULL,
  statis TEXT,
  miro TEXT,
  data_lanc DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_recebimento_cod_sap ON public.recebimento(cod_sap);
CREATE INDEX IF NOT EXISTS idx_recebimento_fornecedor ON public.recebimento(fornecedor);
CREATE INDEX IF NOT EXISTS idx_recebimento_data ON public.recebimento(data_lanc);

CREATE TRIGGER update_recebimento_updated_at 
  BEFORE UPDATE ON recebimento 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Script 5: Tabela Retiradas

```sql
CREATE TABLE IF NOT EXISTS public.retiradas (
  id BIGSERIAL PRIMARY KEY,
  data DATE NOT NULL,
  mes TEXT NOT NULL,
  dia_da_semana TEXT NOT NULL,
  status_da_retirada TEXT NOT NULL,
  empresa TEXT NOT NULL,
  local TEXT NOT NULL,
  solicitante TEXT,
  entregue_por TEXT,
  retirado_por TEXT,
  fazenda TEXT,
  modulo TEXT,
  regional TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_retiradas_regional ON public.retiradas(regional);
CREATE INDEX IF NOT EXISTS idx_retiradas_data ON public.retiradas(data);
CREATE INDEX IF NOT EXISTS idx_retiradas_empresa ON public.retiradas(empresa);
CREATE INDEX IF NOT EXISTS idx_retiradas_status ON public.retiradas(status_da_retirada);
CREATE INDEX IF NOT EXISTS idx_retiradas_mes ON public.retiradas(mes);

CREATE TRIGGER update_retiradas_updated_at 
  BEFORE UPDATE ON retiradas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Script 6: Tabela Valores

```sql
CREATE TABLE IF NOT EXISTS public.valores (
  id BIGSERIAL PRIMARY KEY,
  cod_sap TEXT NOT NULL,
  descricao_item TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  fornecedor_id BIGINT REFERENCES public.fornecedor(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_valores_cod_sap ON public.valores(cod_sap);
CREATE INDEX IF NOT EXISTS idx_valores_fornecedor ON public.valores(fornecedor_id);
```

### Script 7: Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recebimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valores ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (usuários autenticados podem fazer tudo)
CREATE POLICY "Usuários autenticados podem ver fornecedores" 
  ON public.fornecedor FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir fornecedores" 
  ON public.fornecedor FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar fornecedores" 
  ON public.fornecedor FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar fornecedores" 
  ON public.fornecedor FOR DELETE 
  TO authenticated 
  USING (true);

-- Repetir para as outras tabelas (itens, recebimento, retiradas, valores)
-- ... (políticas similares para cada tabela)
```

## 🔐 Configurar Autenticação no Supabase

1. Acesse seu projeto no Supabase
2. Vá em **Authentication** > **Providers**
3. Habilite **Email**
4. Desabilite "Confirm email" para ambiente de desenvolvimento
5. Configure Email Templates se necessário

### Criar primeiro usuário:

1. **Authentication** > **Users** > **Add User**
2. Email: `admin@bracell.com`
3. Senha: `sua-senha-segura`
4. Auto Confirm User: **Sim**

## 📊 Dados de Exemplo (Opcional)

Execute no SQL Editor para popular com dados de teste:

```sql
-- Inserir fornecedores de exemplo
INSERT INTO public.fornecedor (cod_sap, dados_fornecedor) VALUES
  ('F001', 'Fornecedor Exemplo 1'),
  ('F002', 'Fornecedor Exemplo 2'),
  ('F003', 'Fornecedor Exemplo 3');

-- Inserir itens de exemplo
INSERT INTO public.itens (cod_sap, descricao, unidade) VALUES
  ('I001', 'Parafuso M10', 'UN'),
  ('I002', 'Porca M10', 'UN'),
  ('I003', 'Arruela Lisa', 'UN');

-- Inserir recebimentos de exemplo
INSERT INTO public.recebimento (pedido, cod_sap, item, qtde, valor_unit, valor_total, fornecedor, nota_fiscal, data_lanc) VALUES
  ('PED001', 'I001', 'Parafuso M10', 100, 0.50, 50.00, 'Fornecedor Exemplo 1', 'NF001', '2025-01-15'),
  ('PED002', 'I002', 'Porca M10', 200, 0.30, 60.00, 'Fornecedor Exemplo 2', 'NF002', '2025-01-16');

-- Inserir retiradas de exemplo
INSERT INTO public.retiradas (data, mes, dia_da_semana, status_da_retirada, empresa, local, solicitante, regional) VALUES
  ('2025-01-15', 'Janeiro', 'Quarta-feira', 'Concluído', 'Bracell', 'Almoxarifado Central', 'João Silva', 'Sul'),
  ('2025-01-16', 'Janeiro', 'Quinta-feira', 'Pendente', 'Bracell', 'Almoxarifado Norte', 'Maria Santos', 'Norte');
```

## ✅ Checklist Final

Antes de fazer deploy ou compartilhar:

- [ ] `.gitignore` configurado corretamente
- [ ] Credenciais removidas do código
- [ ] Variáveis de ambiente configuradas
- [ ] Todas as tabelas criadas no Supabase
- [ ] RLS habilitado e políticas configuradas
- [ ] Pelo menos um usuário criado
- [ ] Testado localmente
- [ ] README.md atualizado
- [ ] Código commitado e enviado para GitHub

## 🆘 Problemas Comuns

### Erro: "supabaseUrl is required"
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "Invalid API key"
- Verifique se copiou a chave correta do Supabase
- Use a **anon/public** key, não a service_role key

### Erro de autenticação
- Verifique se o usuário foi criado no Supabase
- Verifique se confirmou o email (ou desabilitou confirmação)

### Dados não aparecem
- Verifique se as tabelas foram criadas
- Verifique as políticas RLS
- Verifique o console do navegador para erros

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com:
- **Dev Sócrates**

---

Bom desenvolvimento! 🚀
