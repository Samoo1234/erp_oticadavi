# ERP Ótica Davi - Sistema de Gestão para Ótica

## Visão Geral
Sistema ERP completo desenvolvido especificamente para óticas, oferecendo gestão integrada de clientes, produtos, prescrições médicas, vendas e estoque.

## Funcionalidades Principais

### 1. Gestão de Clientes
- Cadastro completo de clientes
- Histórico de compras
- Prescrições médicas
- Controle de fidelidade

### 2. Catálogo de Produtos
- Óculos de grau e sol
- Lentes (monofocais, bifocais, progressivas)
- Acessórios (estojos, cordões, etc.)
- Controle de marcas e fornecedores

### 3. Sistema de Prescrições
- Digitalização de receitas médicas
- Cálculo automático de lentes
- Histórico de prescrições por cliente

### 4. Vendas e Orçamentos
- Criação de orçamentos
- Processo de venda completo
- Controle de pagamentos
- Emissão de notas fiscais

### 5. Controle de Estoque
- Entrada e saída de produtos
- Controle de validade
- Alertas de reposição
- Inventário físico

### 6. Relatórios e Analytics
- Dashboard executivo
- Relatórios de vendas
- Análise de performance
- Indicadores de negócio

## Tecnologias Utilizadas
- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Documentação**: Swagger

## Estrutura do Projeto
```
erp-otica/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── README.md
└── docs/
    ├── api/
    └── user-guide/
```

## Instalação e Configuração

### Opção 1: Com Supabase (Recomendado) 🚀

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/erp-otica-davi.git
cd erp-otica-davi

# 2. Configure o Supabase
npm run setup-supabase

# 3. Siga as instruções para criar projeto no Supabase
# 4. Edite backend/.env com suas credenciais

# 5. Instale as dependências e inicie
npm run start:supabase
```

### Opção 2: Com PostgreSQL Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/erp-otica-davi.git
cd erp-otica-davi

# 2. Instale as dependências
npm run install:all

# 3. Configure o banco de dados
npm run init-db

# 4. Inicie o sistema
npm run dev
```

### Pré-requisitos
- Node.js 18+
- Supabase (recomendado) ou PostgreSQL 13+
- npm ou yarn

### Scripts Disponíveis
- `npm run frontend-only` - Inicia apenas o frontend (sem banco)
- `npm run setup-supabase` - Configuração do Supabase
- `npm run install:all` - Instala todas as dependências
- `npm run init-db` - Inicializa o banco de dados
- `npm run dev` - Inicia backend e frontend
- `npm run start:supabase` - Configuração completa com Supabase

## Estudo de Caso

### Cenário
Ótica Davi é uma empresa familiar com 5 lojas físicas e 1 e-commerce, atendendo aproximadamente 3.500 clientes ativos. A empresa enfrenta desafios na gestão de:

1. **Prescrições médicas**: Processo manual e propenso a erros
2. **Controle de estoque**: Dificuldade para rastrear produtos entre as 5 lojas
3. **Gestão de clientes**: Informações dispersas em planilhas
4. **Relatórios**: Dados não centralizados e desatualizados

### Solução Proposta
O ERP Ótica Davi centraliza todas as operações em uma plataforma única, oferecendo:

- **Automação de processos**: Redução de 70% no tempo de processamento de pedidos
- **Integração entre as 5 lojas**: Visibilidade completa do estoque
- **Gestão de prescrições**: Digitalização e cálculo automático
- **Relatórios em tempo real**: Tomada de decisão baseada em dados

### Benefícios Esperados
- Aumento de 30% na produtividade
- Redução de 40% nos erros operacionais
- Melhoria de 60% no atendimento ao cliente
- Economia de 30% nos custos operacionais

## Contato
Para mais informações sobre o projeto, entre em contato através do repositório.
