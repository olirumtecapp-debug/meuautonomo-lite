# MeuAutônomo

MeuAutônomo é uma plataforma SaaS mobile-first para profissionais autônomos organizarem o trabalho em um único lugar. A primeira versão cobre onboarding, perfil profissional, serviços, agenda com visualizações de dia/semana/mês, clientes com pesquisa e histórico, Meu Dia, relatórios por período, painel financeiro mensal com gráficos de receitas, pendências, despesas e saldo acumulado, solicitações públicas, anexos, orçamentos com link seguro, respostas do cliente, pagamentos vinculados a cliente/serviço, despesas, notificações internas, cartão digital e preferências de tema claro, escuro ou automático.

## Visão geral

O produto foi desenhado para eletricistas, encanadores, fotógrafos, professores, designers, profissionais de manutenção, prestadores residenciais e outros profissionais que trabalham presencialmente, remotamente ou em deslocamento. A profissão é livre: cada profissional pode escrever a própria descrição e configurar uma página pública amigável.

O fluxo principal é: criar conta com o Manus OAuth → configurar perfil, profissão, primeiro serviço e disponibilidade → usar o painel → compartilhar o cartão público → receber uma solicitação sem exigir conta do cliente → criar orçamento → enviar link seguro → receber aceite/recusa → agendar e registrar o pagamento.

## Tecnologias

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 e componentes Radix/shadcn
- Express 4
- tRPC 11 com SuperJSON
- Drizzle ORM
- MySQL/TiDB gerenciado
- Manus OAuth para autenticação
- S3/Manus Storage para anexos e fotos de perfil
- Vitest para testes
- Vercel/infraestrutura WebDev para o deploy gerenciado

## Estrutura

```text
client/
  src/App.tsx                 Rotas públicas e autenticadas
  src/pages/Home.tsx          Landing page
  src/pages/Workspace.tsx     Onboarding, painel, CRUDs e páginas públicas
  src/components/             Layout, navegação e componentes de UI
  src/index.css               Tokens de tema e estilos globais
drizzle/
  schema.ts                   Modelo MySQL/TiDB
  migrations/                 Migrações geradas pelo Drizzle
server/
  routers.ts                  Contratos tRPC e regras de negócio
  db.ts                       Conexão e helpers de dados
  _core/                      Infraestrutura gerenciada do template
README.md                     Documentação operacional
```

## Banco e isolamento

As tabelas principais são `users`, `professionalProfiles`, `availability`, `services`, `clients`, `appointments`, `requests`, `requestAttachments`, `quotes`, `quoteItems`, `payments` e `notifications`. Todas as entidades de negócio carregam `profileId`, e os procedimentos protegidos sempre resolvem o perfil a partir do usuário autenticado antes de consultar ou alterar dados.

Solicitações públicas são vinculadas ao profissional por `slug` e recebem um `secureToken` aleatório. Orçamentos públicos são acessados por outro token aleatório, sem expor IDs internos ou exigir conta do cliente. Preços são armazenados em centavos para evitar erros de ponto flutuante.

## Ambiente local

1. Instale Node.js 22 e pnpm.
2. Configure as variáveis fornecidas pelo ambiente WebDev, especialmente `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` e as chaves do Forge/Storage.
3. Instale dependências:

   ```bash
   pnpm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   ```

5. Verifique a aplicação em `http://localhost:3000`.

Não coloque `.env` ou segredos no repositório. O template já lê as configurações do ambiente através de `server/_core/env.ts`.

## Banco de dados

O schema atual está em `drizzle/schema.ts`. Para uma alteração futura:

```bash
pnpm drizzle-kit generate
# revise o SQL gerado em drizzle/
# aplique a migração usando o executor de SQL do projeto ou o pipeline de migração aprovado
pnpm check
```

A primeira migração deste projeto foi aplicada ao banco gerenciado. A tabela `users` já existia no scaffold de autenticação; por isso a execução SQL reportou a existência dessa tabela depois de criar as novas tabelas. O banco foi verificado e contém as 13 estruturas esperadas, sem dados de demonstração.

Para backup, use o mecanismo de snapshot/exportação do provedor MySQL/TiDB gerenciado e guarde o arquivo em armazenamento seguro. Nunca inclua credenciais no backup versionado.

## Deploy na Vercel/WebDev

1. Execute `pnpm check`, `pnpm test` e `pnpm build`.
2. Salve um checkpoint do projeto antes da publicação.
3. Publique pelo fluxo WebDev/Vercel configurado para o projeto.
4. Configure as mesmas variáveis de ambiente na implantação.
5. Cadastre o domínio próprio no painel de hospedagem e aponte os registros DNS solicitados.
6. Confirme que `/`, `/app`, `/:slug` e `/orcamento/:token` respondem corretamente.

A aplicação não depende de servidor físico dedicado. O servidor Express é iniciado pelo runtime gerenciado e o banco/storage permanecem externos ao processo web.

## Funcionalidades e limites da primeira versão

A agenda impede conflitos entre atendimentos não cancelados. O formulário público de solicitações cria/atualiza o cliente e gera uma notificação interna. Orçamentos aceitos, recusados ou com alteração solicitada atualizam o registro real e notificam o profissional. O WhatsApp é aberto por links pré-preenchidos quando aplicável; a API oficial não é necessária para o funcionamento básico.

Uploads de anexos usam Storage externo, com limite de três arquivos de até 5 MB e formatos controlados. O financeiro e os relatórios aceitam períodos personalizados com filtragem no servidor. IA, cobrança, automações, equipe/múltiplos profissionais e integração oficial do WhatsApp permanecem desacoplados, sem botões falsos no MVP.

## PWA e Android

`client/public/manifest.json`, ícones SVG, metadata do documento e `client/public/sw.js` tornam o projeto instalável como PWA com cache do shell e fallback offline para navegação. O frontend usa rotas client-side, componentes responsivos e chamadas tRPC que podem ser reutilizadas em PWA/Capacitor. O caminho recomendado é:

```text
Web → PWA com service worker → Capacitor → Android
```

Antes do empacotamento Android, evolua o tratamento de upload em rede instável e valide armazenamento seguro de sessão no dispositivo.

## Continuidade do desenvolvimento

Para adicionar uma funcionalidade, atualize primeiro `drizzle/schema.ts`, gere/revise a migração, implemente helpers em `server/db.ts`, adicione uma procedure protegida ou pública em `server/routers.ts`, e só então conecte a UI com `trpc.*.useQuery`/`useMutation`. Não use `fetch` direto no frontend para dados do produto.

Após cada mudança importante, execute:

```bash
pnpm check
pnpm test
pnpm build
```

Mantenha todas as queries protegidas por `profileId`, valide inputs com Zod e nunca mova chaves privadas para o cliente. Para novas páginas internas, use `DashboardLayout`; para páginas públicas, preserve o layout sem sidebar. O tema é escolhido pelo menu da conta ou pelo seletor da landing page e salvo em `localStorage`; a opção automática acompanha `prefers-color-scheme` em tempo real. A cobertura automatizada atual inclui logout, disponibilidade/conflitos e fluxos de solicitação pública, orçamento multi-item e despesa.

## Dados de teste

A versão entregue foi mantida sem usuários, clientes, agendamentos, solicitações, imagens ou credenciais de demonstração. Ao testar manualmente, use registros temporários e remova-os antes de qualquer publicação compartilhada.
