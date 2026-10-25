# Manual de Arquitetura, Engenharia e Mapa do Sistema — MeuAutônomo

> **Objetivo deste documento**: Garantir total transparência, controle e previsibilidade técnica. Qualquer desenvolvedor, arquiteto ou o próprio fundador do MeuAutônomo deve conseguir entender exatamente onde cada função está, como os dados transitam e quais são as regras de qualidade que garantem estabilidade definitiva.

---

## 1. Visão Geral da Arquitetura

O **MeuAutônomo** é uma aplicação web fullstack desenhada para rodar tanto em servidores dedicados Node.js quanto em ambientes Serverless (Vercel).

```
┌────────────────────────────────────────────────────────┐
│                   CLIENTE (Frontend)                   │
│   React 18 + TypeScript + Vite + Tailwind CSS + Shadcn  │
│   Roteamento: Wouter | Estado/Cache: TanStack React Query│
└──────────────────────────┬─────────────────────────────┘
                           │ Chamadas de API Tipadas (tRPC)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   SERVIDOR (Backend)                   │
│   Node.js + Express + tRPC v10 + Zod (Validação)       │
│   Autenticação: Sessões HTTP-Only / JWT               │
└──────────────────────────┬─────────────────────────────┘
                           │ ORM Drizzle (Type-Safe)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS                       │
│   MySQL (TiDB Cloud / PlanetScale / AWS RDS)           │
│   Fallback automático em memória para testes e demo    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Mapa Completo de Pastas e Arquivos

### 📁 Raiz do Projeto (`/`)
- `package.json`: Scripts de execução, dependências e regras de build.
- `tsconfig.json`: Configurações do compilador TypeScript (tipagem estrita).
- `vite.config.ts`: Configurações de empacotamento do frontend (plugins, aliases `@/`).
- `vitest.config.ts`: Configuração da esteira de testes automatizados unitários e de integração.
- `vercel.json`: Regras de roteamento e Serverless Functions para deploy na Vercel.
- `.env`: Variáveis de ambiente (chaves de API, banco de dados, segredos de sessão).
- `MANUAL_ARQUITETURA_E_ENGENHARIA.md`: Este manual de referência técnica.

---

### 📁 `client/` (Frontend React)

```
client/
├── index.html                  # HTML base da aplicação
└── src/
    ├── App.tsx                 # Roteador principal (Wouter), provedores globais (React Query, tRPC)
    ├── main.tsx                # Ponto de entrada React (ReactDOM.createRoot)
    ├── pages/                  # Páginas principais da aplicação
    │   ├── Home.tsx            # Landing Page de apresentação e captação
    │   ├── Workspace.tsx       # Painel do Profissional (Agenda, Orçamentos, Faturamento)
    │   ├── PublicProfile.tsx   # Cartão Profissional Público (/p/:slug e /:slug) — Isolado e ultra-estável
    │   ├── PublicQuote.tsx     # Proposta Comercial e Orçamento Digital (/orcamento/:token) — Isolado
    │   ├── ClientsPage.tsx     # Gestão de Clientes & Histórico (/clientes) — Isolado e modular
    │   ├── ServicesPage.tsx    # Catálogo de Serviços & Catálogo Sugerido (/servicos) — Isolado e modular
    │   ├── TeamPage.tsx        # Módulo de Equipe & Parceiros (/equipe) — Isolado e modular
    │   ├── Admin.tsx           # Painel Administrativo do MeuAutônomo (Vouchers, Métricas, Gestão)
    │   ├── PlansPage.tsx       # Página de Planos e Assinatura (Free, Pro, Equipe)
    │   ├── ValidateReceipt.tsx # Validador público de recibos e autenticidade jurídica
    │   ├── VideoDemoPage.tsx   # Página de demonstração guiada em vídeo
    │   └── NotFound.tsx        # Página de erro 404
    ├── components/             # Componentes reutilizáveis
    │   ├── DashboardLayout.tsx # Layout padrão do painel (Menu lateral, cabeçalho, perfil)
    │   ├── GuidedTutorialModal.tsx # Passo a passo interativo para novos usuários
    │   ├── AuthModal.tsx       # Modal unificado de Login e Cadastro
    │   ├── ReceiptModal.tsx    # Modal de emissão e compartilhamento de recibo
    │   ├── VoucherRedeemModal.tsx # Modal de resgate de cupons e vouchers
    │   ├── InstallAppModal.tsx # Banner/Prompt de instalação PWA (Adicionar à Tela Inicial)
    │   ├── StateCitySelect.tsx # Seletor dinâmico de Estados e Cidades do Brasil (IBGE)
    │   ├── AIChatBox.tsx       # Assistente virtual integrado
    │   ├── ErrorBoundary.tsx   # Capturador de erros React para evitar tela branca
    │   └── ui/                 # Biblioteca de componentes visuais Shadcn UI (botões, inputs, diálogos, tabelas)
    ├── lib/
    │   └── trpc.ts             # Cliente tRPC configurado com React Query
    ├── hooks/                  # Hooks customizados React
    └── utils/                  # Formatadores de moeda (BRL), datas, máscaras e helpers
```

---

### 📁 `server/` (Backend e Regras de Negócio)

```
server/
├── _core/
│   ├── index.ts                # Inicializador do servidor Express local
│   ├── vercel.ts               # Handler adaptador para a Vercel Serverless
│   ├── trpc.ts                 # Inicialização do tRPC (contexto, middlewares de autenticação)
│   └── oauth.ts                # Provedores de login OAuth
├── routers.ts                  # Todos os endpoints tRPC (rotas de autenticação, agenda, clientes, etc.)
├── db.ts                       # Conexão Drizzle ORM com MySQL e pool de conexões
├── mockDb.ts                   # Banco de dados simulado em memória (para testes sem banco real)
├── billingRules.ts             # Regras matemáticas de cálculo de faturamento, comissões e planos
├── receiptAuth.ts              # Geração e validação de hash criptográfico de recibos
├── email.ts                    # Envio de e-mails transacionais (boas-vindas, lembretes)
├── webhooks/
│   └── asaas.ts                # Receptor de webhooks de pagamento PIX e Cartão do Asaas
└── *.test.ts                   # Testes automatizados da suite de homologação
```

---

### 📁 `drizzle/` (Modelagem de Banco de Dados)
- `schema.ts`: Todas as tabelas, tipos de dados, chaves primárias e relacionamentos.
  - `users`: Usuários e credenciais.
  - `professionalProfiles`: Dados públicos e profissionais, link (`slug`), chaves Pix, planos.
  - `clients`: Carteira de clientes de cada profissional.
  - `services`: Catálogo de serviços com preços e duração.
  - `appointments`: Agendamentos e atendimentos (status, data, valor, comissão).
  - `quotes`: Orçamentos e propostas comerciais emitidas.
  - `teamMembers`: Profissionais parceiros cadastrados (modelo salão-parceiro).
  - `vouchers`: Cupons de ativação de planos PRO/Equipe.
  - `auditLogs`: Registro de auditoria de ações importantes.

---

## 3. Onde Estão as Regras Críticas?

| Funcionalidade | Arquivo Frontend | Arquivo Backend | Tabela do Banco |
|---|---|---|---|
| **Cartão Público / Perfil** | `PublicProfile.tsx` | `routers.ts` (`profile.getBySlug`) | `professionalProfiles` |
| **Agenda e Horários** | `Workspace.tsx` (`AgendaPage`) | `routers.ts` (`appointments.*`) | `appointments` |
| **Cadastro de Clientes** | `ClientsPage.tsx` | `routers.ts` (`clients.*`) | `clients` |
| **Catálogo de Serviços** | `ServicesPage.tsx` | `routers.ts` (`services.*`) | `services` |
| **Orçamentos / Propostas** | `PublicQuote.tsx` / `Workspace.tsx` | `routers.ts` (`quotes.*`) | `quotes` |
| **Equipe & Parceiros** | `TeamPage.tsx` | `routers.ts` (`team.*`) | `teamMembers` |
| **Emissão de Recibos** | `ReceiptModal.tsx` | `routers.ts` (`receipt.*`) | `appointments` / `quotes` |
| **Validação de Recibo** | `ValidateReceipt.tsx` | `routers.ts` (`receipt.validatePublic`) | `receiptAuth.ts` |
| **Planos e Cobrança** | `PlansPage.tsx` | `billingRules.ts` / `routers.ts` | `professionalProfiles` |
| **Vouchers de Desconto** | `VoucherRedeemModal.tsx` | `routers.ts` (`vouchers.redeem`) | `vouchers` |

---

## 4. Esteira de Garantia de Qualidade (Quality Assurance)

Para eliminar definitivamente o medo de "fazer um remendo e quebrar outra coisa", estabelecemos as seguintes travas obrigatórias:

### 🔒 Trava 1: Tipagem Estrita no Build (`tsc --noEmit`)
- **O que faz**: Inspeciona cada linha, cada hook React (`useEffect`, `useState`), cada tipo de parâmetro e cada propriedade em todo o projeto.
- **Onde roda**: Integrado diretamente no comando `pnpm run build` dentro do `package.json`.
- **Efeito prático**: É fisicamente impossível gerar bundle para produção ou subir na Vercel se houver **qualquer** erro de sintaxe ou tipo.

### 🧪 Trava 2: Suite de Testes de Regressão (`pnpm test`)
- **O que faz**: Executa 62 testes unitários e de integração validando:
  - Matemática financeira (cálculos de centavos, comissões, faturamento sem arredondamentos errados).
  - Fluxo de autenticação (criação de conta, login, logout, cookies seguros).
  - Gestão de vouchers e transição de planos (Free -> Pro -> Team).
  - Validação de recibos eletrônicos com hashes de conformidade legal.

### 🌐 Trava 3: Verificação de Rotas HTTP e Endpoints Públicos
- O endpoint `/p/:slug` e `/validar-recibo` devem responder com `HTTP 200 OK` antes de qualquer liberação.

---

## 5. Plano de Desacoplamento e Boas Práticas (Próximos Passos)

O arquivo `Workspace.tsx` possui atualmente todas as abas agrupadas. Para elevar a manutenibilidade para o mais alto padrão de engenharia de software, o plano de refatoração modular é:

1. **Criar subpasta `client/src/pages/workspace/`**:
   - `AgendaTab.tsx` (Agenda e calendário)
   - `ClientesTab.tsx` (Lista e histórico de clientes)
   - `OrcamentosTab.tsx` (Propostas e orçamentos)
   - `EquipeTab.tsx` (Gestão de parceiros e comissões)
   - `FinanceiroTab.tsx` (Extratos, fluxo de caixa e faturamento)
   - `PublicProfileView.tsx` (Cartão público e agendamento pelo cliente)
2. **Deixar o `Workspace.tsx` apenas como orquestrador de abas** (reduzindo de ~7.000 linhas para menos de 300 linhas).
3. **Adicionar testes de renderização de componentes frontend** com `@testing-library/react` para checar que as telas públicas abrem sem falhas mesmo antes do deploy.
