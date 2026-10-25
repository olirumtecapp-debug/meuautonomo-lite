# MeuAutônomo — Continuação no Antigravity

## Estado do projeto

Este pacote contém o projeto completo do MeuAutônomo no estado funcional validado. O escopo foi congelado: não há novas funcionalidades planejadas neste pacote. A aplicação é uma plataforma SaaS mobile-first para profissionais autônomos, com autenticação Manus OAuth, banco MySQL/TiDB gerenciado, storage externo, agenda, clientes, serviços, solicitações públicas, orçamentos, pagamentos, despesas, relatórios, painel financeiro com gráficos, PWA e temas claro/escuro/automático.

## Estrutura principal

- `client/`: frontend React, páginas, componentes, temas e PWA.
- `server/`: Express, tRPC, autenticação, regras de negócio, banco e storage.
- `drizzle/`: schema, relações e migrações SQL já geradas.
- `shared/`: constantes e tipos compartilhados.
- `README.md`: documentação operacional geral.
- `package.json` e `pnpm-lock.yaml`: dependências e scripts reproduzíveis.

## Requisitos locais

- Node.js 22 ou compatível com o projeto.
- pnpm.
- Uma instância MySQL/TiDB acessível.
- Credenciais do ambiente WebDev/Manus para OAuth, sessão, banco e storage.

Instale as dependências:

```bash
pnpm install
```

Use `ENVIRONMENT_VARIABLES.md` como referência e configure os valores reais apenas no ambiente local ou no gerenciador de secrets. Nunca publique `.env`, tokens, senhas, chaves privadas ou credenciais.

## Variáveis de ambiente

As variáveis necessárias estão listadas em `ENVIRONMENT_VARIABLES.md`. Em uma implantação WebDev/Antigravity, configure-as no gerenciador de secrets/variáveis do ambiente, não no código:

- `DATABASE_URL`: conexão MySQL/TiDB.
- `JWT_SECRET`: segredo da sessão.
- `VITE_APP_ID`: identificador do app Manus.
- `OAUTH_SERVER_URL`: servidor OAuth Manus.
- `VITE_OAUTH_PORTAL_URL`: portal de autenticação Manus.
- `OWNER_OPEN_ID` e `OWNER_NAME`: dados do proprietário/admin inicial.
- `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`: APIs/storage gerenciados.
- `VITE_FRONTEND_FORGE_API_URL` e `VITE_FRONTEND_FORGE_API_KEY`: somente quando exigidos pelo frontend do template.

## Executar localmente

```bash
pnpm check
pnpm test
pnpm build
pnpm dev
```

O servidor de desenvolvimento usa a porta 3000 por padrão. O login precisa de HTTPS em produção e depende de cookies habilitados no navegador.

## Banco de dados

O schema está em `drizzle/schema.ts`. As migrações existentes estão em `drizzle/` e refletem o banco gerenciado já preparado para o projeto. Não execute migrações destrutivas em produção sem backup e revisão.

Para uma alteração de schema:

```bash
pnpm drizzle-kit generate
# revisar o SQL criado
# aplicar a migração pelo executor aprovado do ambiente
pnpm check
pnpm test
pnpm build
```

Os dados de negócio são isolados por `profileId`, resolvido a partir do usuário autenticado. O login associa a conta pelo `openId` único retornado pelo provedor OAuth; o e-mail é armazenado como atributo da conta. O mesmo usuário pode acessar seus dados em outro dispositivo usando a mesma conta do provedor.

## Autenticação atual

O app usa Manus OAuth. Os botões públicos exibem `Continuar com Google`, mas o portal Manus é responsável pela autenticação e pode apresentar Google e e-mail, conforme os métodos habilitados para a conta. O MeuAutônomo não armazena senha própria e não implementa recuperação de senha própria.

O callback OAuth usa nonce de uso único em cookie para proteção contra CSRF/session fixation. A sessão principal usa cookie seguro, `HttpOnly`, `SameSite=None` e duração configurada pelo template. Não remova essa proteção nem crie um segundo callback OAuth.

Recuperação de acesso é feita pelo provedor de autenticação. Para Google, use o fluxo oficial de recuperação da conta Google. Para e-mail Manus, use o portal Manus.

## Storage e dados sensíveis

Fotos e anexos são gravados pelo helper de storage gerenciado e apenas a referência é armazenada no banco. Não armazene bytes de arquivos ou segredos em colunas do banco. Não envie chaves privadas para o frontend.

O projeto usa banco e storage gerenciados em nuvem. A conexão configurada do banco possui flag de TLS no ambiente atual. A criptografia em repouso e políticas de backup dependem do plano e da configuração do provedor gerenciado; devem ser confirmadas no painel do ambiente antes de uma operação de produção sensível.

## Checklist de validação

Antes de aceitar qualquer alteração:

```bash
pnpm check
pnpm test
pnpm build
```

A validação do pacote atual foi concluída com:

- TypeScript sem erros.
- 3 arquivos de teste aprovados.
- 7 testes aprovados.
- Build de produção concluído.
- Rotas públicas verificadas.
- PWA (`manifest.json` e `sw.js`) presente no build.
- Login público verificado até a abertura do portal OAuth.

O teste completo de uma conta Google/e-mail e sincronização entre dois dispositivos exige autenticação manual do proprietário da conta. Não use credenciais em scripts ou no repositório.

## Publicação

1. Configure as variáveis no ambiente de publicação.
2. Execute `pnpm check`, `pnpm test` e `pnpm build`.
3. Salve um checkpoint/versionamento.
4. Publique pelo fluxo do ambiente.
5. Verifique `/`, `/app`, páginas públicas por slug e `/orcamento/:token`.
6. Faça um login manual com uma conta de teste controlada.
7. Crie um registro temporário em um dispositivo e confirme no segundo dispositivo usando a mesma conta.

## Regra de continuidade

Preserve o escopo. Antes de adicionar qualquer coisa, confirme se é realmente necessária para corrigir um erro existente. Prefira mudanças pequenas, reversíveis e testadas. Não adicionar passkey, Microsoft, Apple, senha própria, cobrança, IA, automações ou equipe sem uma nova decisão explícita de produto.

## URL pública atual

A URL pública verificada durante a entrega é:

`https://meuautonome-vmrf8enk.manus.space`

A URL pode mudar se o projeto for republicado em outro ambiente; confirme sempre no painel de publicação.
