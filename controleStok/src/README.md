# 🏭 Sistema de Gestão de Estoque - Bracell Logística

Sistema web completo de controle de estoque desenvolvido para o setor de Logística - Estradas da Bracell.

![Bracell Logo](https://via.placeholder.com/200x50/10b981/ffffff?text=Bracell+Logistica)

## 🎯 Funcionalidades

### 📊 Módulos Principais

1. **Painel Geral**
   - Visão geral com cards de estatísticas
   - Recebimentos recentes
   - Retiradas recentes
   - Alertas de estoque baixo

2. **Recebimentos**
   - CRUD completo de recebimentos
   - Busca e filtros avançados
   - Edição inline
   - Integração com SAP

3. **Retiradas**
   - Gestão de retiradas de materiais
   - Controle por regional, fazenda e módulo
   - Status em tempo real
   - Rastreamento completo

4. **Itens de Retirada**
   - Controle detalhado de itens
   - Vinculação com retiradas
   - Gestão de quantidades

5. **Dashboard de Gráficos**
   - Evolução de recebimentos e retiradas
   - Valor total movimentado
   - Top fornecedores
   - Análise por regional
   - Status de retiradas

## 🚀 Tecnologias Utilizadas

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Gráficos**: Recharts
- **Animações**: Motion (Framer Motion)
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Git

## ⚙️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/bracell-logistica.git
cd bracell-logistica
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Configure o banco de dados

Execute os scripts SQL no Supabase SQL Editor (ver seção "Scripts SQL" abaixo).

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `fornecedor`
```sql
- id (bigserial, PK)
- cod_sap (text)
- dados_fornecedor (text)
- created_at (timestamp)
```

#### `itens`
```sql
- id (bigserial, PK)
- cod_sap (text)
- descricao (text)
- unidade (text)
- created_at (timestamp)
```

#### `recebimento`
```sql
- id (bigserial, PK)
- pedido (text)
- cod_sap (text)
- item (text)
- qtde (numeric)
- valor_unit (numeric)
- valor_total (numeric)
- fornecedor (text)
- nota_fiscal (text)
- statis (text)
- miro (text)
- data_lanc (date)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `retiradas`
```sql
- id (bigserial, PK)
- data (date, NOT NULL)
- mes (text, NOT NULL)
- dia_da_semana (text, NOT NULL)
- status_da_retirada (text, NOT NULL)
- empresa (text, NOT NULL)
- local (text, NOT NULL)
- solicitante (text)
- entregue_por (text)
- retirado_por (text)
- fazenda (text)
- modulo (text)
- regional (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `valores`
```sql
- id (bigserial, PK)
- cod_sap (text)
- descricao_item (text)
- valor (numeric)
- fornecedor_id (bigint, FK)
- created_at (timestamp)
```

## 🔐 Autenticação

O sistema utiliza Supabase Auth. Para criar um usuário:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** > **Users**
3. Clique em **Add User**
4. Insira email e senha

## 🎨 Design System

### Cores

- **Gradiente Principal**: Verde (#10b981) → Roxo (#8b5cf6)
- **Background**: Dark theme com gradiente
- **Cards**: Fundo translúcido com blur
- **Texto**: Branco com opacidades variadas

### Componentes

- Border radius padrão: 1rem
- Box shadow: 0 4px 10px rgba(0,0,0,0.1)
- Backdrop blur em cards e modais
- Animações suaves com Motion

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1920px)
- Mobile (320px - 768px)

## 🔄 Tempo Real

Todas as páginas possuem atualização em tempo real via Supabase Realtime:
- Mudanças no banco refletem instantaneamente
- Múltiplos usuários podem trabalhar simultaneamente
- Sincronização automática de dados

## 📊 Gráficos Disponíveis

1. **Evolução de Recebimentos e Retiradas** (Linha)
2. **Valor Total Movimentado** (Barras)
3. **Top Fornecedores por Valor** (Pizza)
4. **Volume por Fornecedor** (Barras Horizontais)
5. **Status de Retiradas** (Pizza)
6. **Retiradas por Regional** (Barras)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 📂 Estrutura de Pastas

```
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   └── Layout.tsx      # Layout principal
├── contexts/           # Context API (Auth)
├── lib/               # Utilitários e configurações
│   └── supabase.ts    # Cliente Supabase
├── pages/             # Páginas da aplicação
├── styles/            # Estilos globais
└── App.tsx            # Componente raiz
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para uso interno da Bracell.

## 👨‍💻 Desenvolvedor

**Dev Sócrates**

---

© 2025 Bracell - Sistema de Gestão de Estoque. Todos os direitos reservados.
