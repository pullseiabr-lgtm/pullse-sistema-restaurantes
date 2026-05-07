# Checklist de Escaneamento — Foozi

Baseado no checklist do `playbook_sistema_fullstack.md` §3.4.

## Status

| Item | Status | Observação |
|------|--------|------------|
| Endpoints mapeados (API) | ⚠️ Parcial | Foozi é Next.js + RSC; não há REST tradicional. API pública existe via chaves de acesso (não documentada em /api/docs — 404). Estratégia: usar chave de acesso real para descobrir base URL e contratos quando necessário. |
| Schema do banco exportado | ❌ | Não temos acesso ao banco original. Schema **inferido** a partir de UI/forms está em `03-modelo-dados.md`. |
| Diagrama ER gerado | 📝 | Schema Prisma gerado serve como ER. Comando: `pnpm --filter @amore/backend prisma generate` + `prisma-erd-generator`. |
| Regras de autenticação documentadas | ✅ | Cookie-based, sem 2FA, multi-tenant Tenant → Store. |
| Roles e permissões mapeados | ⚠️ | Roles inferidos: SUPERADMIN, ADMIN, MANAGER, BUYER, USER. Granularidade fina via StoreAccess. |
| Integrações externas identificadas | ⚠️ | PostHog (analytics), Vercel (hosting). Submenu "Integrações" do menu API não foi explorado. |
| Jobs/cron documentados | ⚠️ | "Requisições Automáticas" sugere cron. Não foi escaneado profundamente. |
| Variáveis de ambiente identificadas | ✅ | Listadas em `.env.example`. |

## Áreas escaneadas profundamente

- ✅ **Dashboard** (KPIs, filtros)
- ✅ **Fornecedores** (lista + form completo de cadastro)
- ✅ **Produtos** (lista — 59.257 itens; form não acessível ao papel atual)
- ✅ **Requisições** (estrutura do wizard de 4 etapas)
- ✅ **API → Chaves de Acesso** (form de criação)

## Áreas com escaneamento superficial (TODO)

- ⚠️ **Requisições Automáticas** — submenu não expandido
- ⚠️ **Lista de compra** — submenu não expandido
- ⚠️ **Estoque** — entradas/saídas/saldo a mapear
- ⚠️ **Configurações** — não acessada
- ⚠️ **Suporte** — não acessada
- ⚠️ **Minha conta** — não acessada
- ⚠️ **API → Webhooks** — eventos disponíveis a documentar
- ⚠️ **API → Integrações** — não acessada
- ⚠️ **Ofertas Exclusivas** — funcionalidade não explorada

## Workflow recomendado para completar

Quando voltar a aprofundar o escaneamento, para cada área:

1. Navegar para `/{area}`
2. Capturar `read_page` da lista (colunas + filtros + ações)
3. Navegar para `/{area}/novo` (ou equivalente)
4. Capturar `get_page_text` do formulário (todos os campos)
5. Capturar `read_network_requests` durante interações para detectar Server Actions
6. Atualizar `03-modelo-dados.md` com a nova entidade
7. Adicionar módulo NestJS correspondente (controller + service + DTOs)
8. Adicionar página/hook no frontend

## Próxima conversa

Para continuar daqui, peça algo como:

> "Continue o escaneamento — comece por Estoque e Lista de compra, e depois adicione os módulos backend correspondentes."

ou

> "Aprofunde o módulo de Requisições no frontend — implemente a página de listagem e o wizard de criação."
