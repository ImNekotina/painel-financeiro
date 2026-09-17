# Painel Financeiro

Dashboard moderno de finanças pessoais: receitas, despesas, categorias e
metas de economia, com painel privado por usuário.

Construído com **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 ·
PostgreSQL · Prisma**.

> ⚠️ **Este é um projeto de demonstração.** Antes de usar com dados
> financeiros reais, leia a seção [O que falta para produção](#o-que-falta-para-produção).

---

## Índice

1. [Stack e arquitetura](#stack-e-arquitetura)
2. [Estrutura de pastas](#estrutura-de-pastas)
3. [Como instalar e rodar](#como-instalar-e-rodar)
4. [Como testar a autenticação](#como-testar-a-autenticação)
5. [Como testar isolamento entre usuários (IDOR)](#como-testar-isolamento-entre-usuários-idor)
6. [Estratégia de autenticação e autorização](#estratégia-de-autenticação-e-autorização)
7. [Medidas de segurança implementadas](#medidas-de-segurança-implementadas)
8. [Limitações conhecidas / não implementado](#limitações-conhecidas--não-implementado)
9. [O que falta para produção](#o-que-falta-para-produção)
10. [Nota sobre o ambiente onde este projeto foi gerado](#nota-sobre-o-ambiente-onde-este-projeto-foi-gerado)

---

## Stack e arquitetura

| Camada          | Tecnologia                                             |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Server Components + Actions)     |
| Linguagem       | TypeScript                                               |
| Estilo          | Tailwind CSS v4 (dark mode manual + `prefers-color-scheme`) |
| Banco de dados  | PostgreSQL                                               |
| ORM             | Prisma 6                                                 |
| Autenticação    | Sessões próprias, server-side, com cookie `httpOnly`     |
| Hash de senha   | bcryptjs (12 rounds)                                     |
| Validação       | Zod (client + server)                                    |
| Gráficos        | Recharts                                                 |
| Ícones          | lucide-react                                             |

**Por que sessão própria em vez de uma lib de auth pronta?** Para manter o
projeto sem dependências externas de serviço (sem precisar de chaves de
terceiros) e para que toda a lógica de autenticação/autorização fique
visível e auditável no próprio código (`src/lib/session.ts`,
`src/actions/auth.ts`). Para produção, trocar por uma solução mais robusta
(Auth.js, Lucia, Clerk etc.) é uma opção válida — ver limitações abaixo.

---

## Estrutura de pastas

```
painel-financeiro/
├── prisma/
│   ├── schema.prisma        # Modelos: User, Session, Category, Transaction, Goal
│   └── seed.ts               # Dados de DESENVOLVIMENTO apenas
├── src/
│   ├── proxy.ts              # Proteção de rotas + CSP com nonce (antigo middleware.ts)
│   ├── actions/               # Server Actions (mutações — sempre autenticadas/autorizadas)
│   │   ├── auth.ts            # registro, login, logout
│   │   ├── transactions.ts    # CRUD de transações
│   │   ├── categories.ts      # CRUD de categorias
│   │   ├── goals.ts           # CRUD de metas
│   │   └── profile.ts         # editar perfil, trocar senha
│   ├── schemas/                # Validação Zod (mesmos schemas usados no cliente e servidor)
│   ├── lib/
│   │   ├── prisma.ts           # Client Prisma singleton
│   │   ├── session.ts          # Criação/verificação de sessão (server-only)
│   │   ├── session-constants.ts# Nome do cookie (importável pelo proxy)
│   │   ├── password.ts         # hash/verificação de senha (bcrypt)
│   │   ├── rate-limit.ts       # Rate limiting em memória
│   │   ├── money.ts            # Conversão/formatação de valores (centavos ↔ R$)
│   │   └── data.ts             # Todas as consultas ao banco, sempre escopadas ao usuário logado
│   ├── components/
│   │   ├── ui/                 # Button, Input, Select, Card, Modal, Badge, etc.
│   │   ├── layout/              # Sidebar, navegação mobile, alternador de tema
│   │   ├── auth/                 # Formulários de login/registro
│   │   └── dashboard/            # Gráficos, cards de resumo, formulários de transação/meta/categoria
│   └── app/
│       ├── page.tsx              # Landing
│       ├── login/, register/, forgot-password/
│       ├── api/transactions/[id]/route.ts  # Exemplo de rota protegida (ver testes de IDOR)
│       └── dashboard/
│           ├── layout.tsx         # Protegido: exige sessão válida no servidor
│           ├── page.tsx           # Visão geral
│           ├── transactions/
│           ├── goals/
│           ├── categories/
│           └── profile/
├── next.config.ts             # Headers de segurança estáticos
├── .env.example
└── README.md
```

---

## Como instalar e rodar

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (local, Docker, ou um serviço gerenciado como Supabase/Neon/RDS)

### 1. Instalar dependências

```bash
npm install
```

O `postinstall` já roda `prisma generate` automaticamente.

### 2. Configurar o PostgreSQL

Suba um PostgreSQL local rapidamente com Docker:

```bash
docker run --name painel-financeiro-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=painel_financeiro \
  -p 5432:5432 -d postgres:16
```

Ou use qualquer instância PostgreSQL já existente — só precisa da URL de
conexão.

### 3. Configurar o `.env`

```bash
cp .env.example .env
```

Edite `DATABASE_URL` em `.env` com sua string de conexão real. Nunca
comite o `.env` (já está no `.gitignore`).

### 4. Rodar as migrations

```bash
npm run db:migrate
```

Isso cria as tabelas no PostgreSQL a partir de `prisma/schema.prisma` e
gera a primeira migration em `prisma/migrations/`.

### 5. (Opcional) Popular com dados de desenvolvimento

```bash
npm run db:seed
```

Cria um usuário de demonstração:

- **E-mail:** `demo@painelfinanceiro.dev`
- **Senha:** `Demo1234`

> Esses dados são fictícios e apenas para desenvolvimento — nunca rode o
> seed contra um banco de produção.

### 6. Ambiente de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 7. Build e produção

```bash
npm run build
npm start
```

Antes de rodar `build` em produção, aplique as migrations com
`npm run db:migrate:deploy` (não use `db:migrate` em produção, pois ele é
interativo/dev-only).

### Scripts disponíveis

| Script                     | Descrição                                       |
| --------------------------- | ------------------------------------------------ |
| `npm run dev`                | Servidor de desenvolvimento                       |
| `npm run build`              | Build de produção                                 |
| `npm start`                  | Servidor de produção (após `build`)               |
| `npm run lint`                | ESLint                                            |
| `npm run db:generate`         | Gera o Prisma Client                              |
| `npm run db:migrate`          | Cria/aplica migrations em desenvolvimento         |
| `npm run db:migrate:deploy`   | Aplica migrations existentes (uso em produção)    |
| `npm run db:seed`             | Popula dados de demonstração                      |
| `npm run db:studio`           | Abre o Prisma Studio (explorador visual do banco) |

---

## Como testar a autenticação

1. Rode `npm run dev` e acesse `/register`.
2. Crie uma conta com um e-mail e senha que atenda aos requisitos (mín. 8
   caracteres, com maiúscula, minúscula e número).
3. Você será redirecionado para `/dashboard` automaticamente (sessão criada).
4. Clique em "Sair" na sidebar — o cookie de sessão é removido e a sessão
   é apagada do banco (não apenas do navegador).
5. Tente acessar `/dashboard` diretamente sem estar logado: você será
   redirecionado para `/login`.
6. Erre a senha propositalmente 10+ vezes em `/login` — o rate limiting
   deve bloquear novas tentativas por 15 minutos.

---

## Como testar isolamento entre usuários (IDOR)

Este é o teste de segurança mais importante do projeto (ver item 10 do
briefing original).

### Via interface / API

1. Crie o **Usuário A**, adicione uma transação, copie o ID dela (você
   pode ver o ID no Prisma Studio: `npm run db:studio`).
2. Faça logout e crie o **Usuário B** (ou use uma aba anônima).
3. Como Usuário B, tente acessar:
   ```
   GET http://localhost:3000/api/transactions/<ID_DA_TRANSACAO_DO_USUARIO_A>
   ```
   (com o cookie de sessão do Usuário B — ex.: abrindo essa URL no mesmo
   navegador em que você logou como B).
4. **Resultado esperado:** `404 Not Found` — nunca os dados do Usuário A.

### Via código (todas as camadas)

Toda função em `src/lib/data.ts` e toda Server Action em `src/actions/`
funciona assim:

```ts
const user = await requireUser(); // deriva o usuário SOMENTE da sessão no servidor
await prisma.transaction.findMany({ where: { userId: user.id, ... } });
// updates/deletes usam updateMany/deleteMany com WHERE id AND userId,
// então tentar editar/excluir um registro de outro usuário simplesmente
// não afeta nenhuma linha (count === 0), sem vazar existência do recurso.
```

Nenhuma função aceita um `userId` vindo de fora — não há como um Usuário B
manipular um formulário, uma URL ou uma chamada de action para acessar
dados do Usuário A.

---

## Estratégia de autenticação e autorização

**Autenticação (quem é você):**

- Senha é sempre hasheada com bcrypt (12 rounds) antes de ir ao banco;
  nunca é armazenada nem retornada em texto puro.
- Ao logar/registrar, criamos uma sessão: um token aleatório de 32 bytes é
  gerado, um cookie `httpOnly`, `sameSite=lax` (e `secure` em produção)
  guarda esse token no navegador, e o **hash SHA-256** do token (não o
  token em si) é salvo na tabela `sessions`. Se o banco vazar, os tokens
  de sessão não podem ser reutilizados diretamente.
- `getCurrentUser()`/`requireUser()` (em `src/lib/session.ts`) são o único
  ponto de verdade sobre quem está logado — sempre consultam o banco.

**Autorização (o que você pode acessar):**

- Nenhuma query ou mutação confia em um `userId`/`id` vindo do
  cliente para decidir o que retornar. Toda leitura filtra por
  `userId: user.id` (derivado da sessão); toda escrita usa
  `updateMany`/`deleteMany` com a mesma condição, então uma tentativa de
  editar/excluir um recurso alheio simplesmente não encontra nada.
- Duas camadas de checagem de sessão: uma rápida no `proxy.ts` (só
  verifica se existe cookie, para UX — redireciona cedo) e uma
  autoritativa no layout do dashboard e em cada Server Action (consulta o
  banco de fato).

---

## Medidas de segurança implementadas

- [x] Senhas com bcrypt (nunca texto puro, nunca retornadas ao cliente)
- [x] Sessões server-side com cookie `httpOnly` + hash do token no banco
- [x] `.env` fora do Git, com `.env.example` sem segredos reais
- [x] Toda leitura/escrita de dados financeiros escopada ao usuário autenticado
- [x] Proteção contra IDOR em todas as entidades (Transaction, Category, Goal)
- [x] Validação Zod no servidor (e no cliente, via `useActionState` + os mesmos schemas)
- [x] Prisma parametrizado (sem SQL cru/concatenado em nenhum lugar)
- [x] Sem `dangerouslySetInnerHTML` com conteúdo do usuário (descrições/nomes são sempre texto)
- [x] Rate limiting em `/login` e `/register`
- [x] Cookies com `httpOnly`, `sameSite=lax`, `secure` em produção
- [x] Headers de segurança: `Content-Security-Policy` (com nonce por
      requisição), `X-Content-Type-Options`, `X-Frame-Options`,
      `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
      (produção)
- [x] Erros internos nunca expostos ao usuário final (mensagens genéricas;
      detalhes ficam apenas nos logs do servidor)
- [x] Sem log de senhas, tokens ou dados financeiros sensíveis
- [x] Valores monetários em centavos (inteiros), nunca `float`
- [x] IDs, e-mails, datas e valores validados e limitados (tamanho máximo,
      valores não-negativos onde aplicável, etc.)
- [x] Troca de senha invalida a sessão atual (obriga novo login)
- [x] TypeScript e ESLint configurados e sem erros no código da aplicação
      (ver nota na seção de limitações sobre o ambiente de geração)

---

## Limitações conhecidas / não implementado

Deixadas claramente de fora do escopo desta primeira versão:

- **Recuperação de senha por e-mail**: a tela `/forgot-password` existe,
  mas apenas informa que a funcionalidade não está disponível. Um fluxo
  completo exigiria um provedor de e-mail transacional (Resend, SES,
  Postmark...) e tokens de redefinição com expiração — fora do escopo
  aqui, mas o modelo de dados já comporta a adição futura.
- **Verificação de e-mail no cadastro.**
- **2FA / MFA.**
- **WebSockets para tempo real** — o dashboard atualiza via revalidação de
  cache do Next.js (`revalidatePath`) após cada mutação, o que é suficiente
  para o caso de uso, mas não é "tempo real" entre abas/dispositivos
  diferentes sem recarregar a página.

---

## O que falta para produção

Itens a avaliar/implementar antes de operar isso com dinheiro real de
usuários:

1. **Rate limiting distribuído**: a implementação atual (`src/lib/rate-limit.ts`)
   é em memória, por processo. Em produção com múltiplas instâncias ou
   serverless, isso não protege de forma confiável — troque por um
   armazenamento compartilhado (Redis/Upstash) ou um serviço dedicado
   (ex.: Vercel Firewall/WAF, Cloudflare).
2. **Recuperação de senha e verificação de e-mail** (ver acima).
3. **Auditoria e logging estruturado**: adicionar um logger estruturado
   (ex.: Pino) com integração a uma plataforma de observabilidade, e um
   log de auditoria para ações sensíveis (login, troca de senha,
   exclusões).
4. **Backups automáticos do PostgreSQL** e um plano de disaster recovery.
5. **Revisão de CSP em produção**: teste a Content-Security-Policy contra
   o domínio real de produção e ajuste `connect-src`/`img-src` se você
   adicionar serviços externos (analytics, CDN de imagens, etc.).
6. **Testes automatizados**: este projeto não inclui testes (unitários,
   integração ou E2E). Antes de produção, adicione cobertura para as
   Server Actions (especialmente os caminhos de autorização) e para o
   fluxo de autenticação.
7. **Revisão de terceiros / pentest**: uma revisão de segurança
   independente é recomendada para qualquer aplicação que lide com dados
   financeiros reais.
8. **Conformidade legal**: dependendo da jurisdição e do uso, avalie
   requisitos de LGPD/GDPR (retenção de dados, direito ao esquecimento,
   termos de uso, política de privacidade).
9. **SSL/TLS do PostgreSQL em produção**: garanta `sslmode=require` (ou
   equivalente) na `DATABASE_URL` e que o banco não esteja publicamente
   acessível sem necessidade (use VPC/firewall do seu provedor).
10. **Monitoramento de erros** (ex.: Sentry) para detectar falhas em
    produção sem expor detalhes ao usuário final.

---

## Nota sobre o ambiente onde este projeto foi gerado

Este projeto foi montado em um ambiente sandbox com acesso de rede
restrito a poucos domínios (npm, GitHub, repositórios de pacotes). Dois
comandos não puderam ser executados **nesse ambiente específico**, mas
funcionam normalmente em qualquer máquina com acesso à internet:

- `npx prisma generate` — precisa baixar o engine binário do Prisma
  (`binaries.prisma.sh`), que não estava liberado no sandbox. Isso está
  configurado para rodar automaticamente via `postinstall` no seu
  `npm install`.
- O download da fonte "Inter" do Google Fonts durante `next build` — pelo
  mesmo motivo de rede. Funciona normalmente com internet padrão.

Para compensar, o projeto foi validado neste ambiente da seguinte forma:

- `npx eslint .` rodou **sem erros** em todo o código.
- `npx next build` completou a etapa de **compilação/bundling com sucesso**
  (o único erro foi o download da fonte, um problema de rede do sandbox,
  não do código).
- A checagem de tipos (`tsc --noEmit`) mostrou apenas erros esperados,
  todos decorrentes do Prisma Client ainda não ter sido gerado (por
  exemplo, `Module '"@prisma/client"' has no exported member 'Category'`)
  — eles desaparecem assim que você roda `npm install` (que já dispara
  `prisma generate` via `postinstall`) no seu ambiente.

Ou seja: rode `npm install && npm run db:migrate && npm run dev` na sua
máquina e o projeto deve funcionar de ponta a ponta.
