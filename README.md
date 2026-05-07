# Amore Restaurante — Sistema de Gestão de Compras

Replicação fullstack do sistema **Foozi** (`app.foozi.com.br`) com stack moderna: React + TypeScript + NestJS + Prisma + Supabase. Monorepo Turborepo gerenciado por pnpm.

> Stack alvo definida no [`playbook_sistema_fullstack.md`](./playbook_sistema_fullstack.md). Documentação do escaneamento do sistema-alvo em [`docs/scan/`](./docs/scan/).

## Estrutura

```
.
├── apps/
│   ├── backend/         # NestJS API (REST + Swagger em /api/v1/docs)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts  # Cria SUPERADMIN inicial (idempotente)
│   │   └── src/
│   │       ├── auth/        # JWT + bcrypt + roles
│   │       ├── users/       # CRUD usuários
│   │       ├── suppliers/   # Fornecedores
│   │       ├── products/    # Produtos
│   │       ├── requisitions/# Requisições / cotações
│   │       ├── prisma/      # PrismaService
│   │       ├── common/      # Filtros, decorators, guards
│   │       └── config/      # Validação de env
│   └── frontend/        # React + Vite + Tailwind + TanStack Query
├── packages/
│   └── shared/          # Tipos compartilhados
├── docs/scan/           # Documentação do sistema-alvo
└── docker-compose.yml   # Postgres local (alternativa ao Supabase em dev)
```

## Pré-requisitos

- **Node.js** ≥ 20 LTS
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker** (opcional — para Postgres local)
- Conta **Supabase** com o projeto provisionado

## Setup

### 1. Clonar e instalar

```bash
pnpm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
# Edite .env e preencha:
#   DATABASE_URL, DIRECT_URL (Supabase)
#   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   JWT_SECRET (gere com: openssl rand -hex 32)
#   SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
```

> **Nunca commite o `.env`.** As credenciais reais do Supabase estão no playbook (não versionado).

### 3. Banco de dados

Conectar ao Supabase do projeto:

```bash
pnpm --filter @amore/backend prisma generate
pnpm --filter @amore/backend prisma migrate deploy   # ou: prisma migrate dev
pnpm db:seed                                         # cria o SUPERADMIN
```

Para Postgres local (sem Supabase):

```bash
docker compose up -d postgres
# Ajuste DATABASE_URL no .env para postgresql://postgres:postgres@localhost:5432/amore_dev
pnpm --filter @amore/backend prisma migrate dev
pnpm db:seed
```

### 4. Rodar em dev

```bash
pnpm dev   # roda backend (porta 3001) e frontend (porta 5173) em paralelo
```

Acessos:

- API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/api/v1/docs>
- Frontend: <http://localhost:5173>
- Prisma Studio: `pnpm db:studio`

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe backend + frontend |
| `pnpm build` | Build de todos os apps |
| `pnpm lint` | Lint em todo o monorepo |
| `pnpm test` | Testes |
| `pnpm type-check` | Type-check global |
| `pnpm db:migrate` | Cria nova migration Prisma |
| `pnpm db:seed` | Roda o seed (idempotente) |
| `pnpm db:reset` | Apaga tudo e roda migrations + seed (DEV only!) |
| `pnpm db:studio` | Abre Prisma Studio |

## Status atual

### Concluído

- [x] **Fase 1** — Escaneamento do Foozi (vide `docs/scan/`)
  - [x] Estrutura de navegação (12 áreas mapeadas)
  - [x] API pública identificada (chaves de acesso por filial + webhooks)
  - [x] Modelo de dados base (Tenant, Store, Supplier, Product, Requisition + Quote + ShoppingList + Inventory)
  - [x] Tecnologia detectada: Foozi é Next.js + RSC (não há REST tradicional)
- [x] **Fase 2** — Bootstrap do monorepo (Turborepo + pnpm)
- [x] **Fase 3** — Schema Prisma completo + seed superadmin idempotente
- [x] **Fase 4** — Backend NestJS: AuthModule (JWT), UsersModule, SuppliersModule, ProductsModule, RequisitionsModule (todos com Swagger e validation pipe)
- [x] **Fase 5** — Frontend React + Vite + Tailwind: login, dashboard, layout autenticado, store Zustand persistido, TanStack Query, Axios interceptors

### Próximos passos

- [ ] Aprofundar escaneamento das áreas restantes (Estoque, Lista de compra, Configurações, Webhooks, Integrações, Requisições Automáticas)
- [ ] Implementar páginas Frontend para Requisições / Fornecedores / Produtos
- [ ] Cotações (Quote) — endpoints e UI para fornecedores responderem
- [ ] Workflow de aprovação de requisição
- [ ] Integração Supabase Storage para imagens de produtos/fornecedores
- [ ] Webhooks (assinatura HMAC + envio em background)
- [ ] Importação CSV de produtos/fornecedores
- [ ] Testes E2E (paridade com Foozi por endpoint)
- [ ] Deploy (Vercel para frontend, Railway/Fly/Render para backend)

## Segurança

- Senhas com **bcrypt** (cost 12)
- JWT com `JWT_SECRET` validado via class-validator
- **API Keys** com hash; token bruto exibido uma única vez
- **Roles** (SUPERADMIN, ADMIN, MANAGER, BUYER, USER) com guard
- **Rate limiting** global via @nestjs/throttler (120 req/min)
- **Helmet** para headers de segurança
- **CORS** restrito por configuração
- **Soft delete** em entidades sensíveis
- **AuditLog** para ações críticas

## Licença

Proprietário — Pullse / Amore Food. Não distribuir.
