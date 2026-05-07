# Foozi — Mapeamento de Páginas e Estrutura

> Inventário das telas e fluxos do sistema-alvo `app.foozi.com.br`. Atualizado durante a Fase 1 — Escaneamento.

## Tecnologia identificada

- **Frontend:** Next.js (App Router) com **React Server Components** (RSC)
  - Evidência: requisições com `?_rsc=...` query parameters
  - Evidência: rotas `/_next/static/chunks/*.js`
  - Header `next-action` esperado em mutations (Server Actions)
- **Build/Deploy:** Vercel (header `dpl_3StCdYpTH1hviWTfAUP9XYzDyziY` indica deployment ID)
- **Analytics:** PostHog (`us.i.posthog.com`)
- **Auth:** cookie-based (conforme playbook)
- **Multi-tenant:** seletor de tenant (FLOWPAIVA) e seletor de loja/unidade (AMORE COSTA DOURADA) no topo

## Implicação arquitetural para a migração

Foozi não expõe um REST API tradicional consumível pelo browser. Os dados fluem via:
- Streams de RSC (server-rendered React payloads)
- **Server Actions** (POSTs anônimos com header `Next-Action: <hash>`)
- Possível API pública — verificar menu "API → Chaves de Acesso / Webhooks"

Para a versão replicada (NestJS REST), precisaremos:
- Mapear cada tela e ação observada
- Inferir contratos a partir dos formulários e responses RSC
- Reconstruir tudo como REST API explícito (`/api/v1/...`) — alinhado ao playbook

---

## Estrutura de Navegação Principal (sidebar esquerda)

| # | Item | Subitens conhecidos | Observação |
|---|------|---------------------|------------|
| 1 | Dashboard | — | Home com KPIs |
| 2 | Requisições | (a expandir) | |
| 3 | Requisições Automáticas | (a expandir) | Rotinas/cron |
| 4 | Fornecedores | Lista, Novo | |
| 5 | Produtos | (a expandir) | |
| 6 | Lista de compra | (a expandir) | |
| 7 | Estoque | (a expandir) | |
| 8 | Configurações | — | |
| 9 | Ofertas Exclusivas | — | Promoções |
| 10 | Suporte | (a expandir) | |
| 11 | Minha conta | (a expandir) | |
| 12 | API | Chaves de Acesso, Webhooks | **Indica API pública existente** |

## Header Bar (topo)

- Toggle sidebar (botão hambúrguer)
- **Seletor de Tenant** (org/empresa) — atual: `FLOWPAIVA`
- **Seletor de Loja/Unidade** — atual: `AMORE COSTA DOURADA`
- Sino de notificações

## Dashboard — Cards de KPI

| Card | Tipo | Observação |
|------|------|------------|
| Total de pedidos | counter (int) | |
| Total em compras | currency (BRL) | |
| Economia gerada | currency (BRL) | métrica derivada |
| Porcentagem de economia | % | métrica derivada |
| Valor total previsto | currency | |
| Produtos | counter | quantidade de produtos cadastrados? |
| Custo de Compra | currency + input | input do faturamento + botão "Calcular" |
| Custo da Mercadoria Vendida | currency + input | mesma lógica (CMV) |
| Economia do Período | gráfico | (não totalmente visível ainda) |
| Distribuição de Gastos | gráfico | (não totalmente visível ainda) |

**Filtros do dashboard:**
- Date range picker (atual: `1 de mai 2026 - 31 de mai 2026`)
- Seletor de unidade (atual: `AMORE COSTA DOURADA`)
- Menu kebab (3 pontinhos verticais) — ações adicionais

## Domínio do negócio (inferência inicial)

Foozi é um SaaS B2B para **gestão de compras de restaurantes**. Conceitos principais:

- **Tenant / Empresa** (FLOWPAIVA): grupo proprietário
- **Loja / Unidade** (AMORE COSTA DOURADA): ponto de operação dentro do tenant
- **Fornecedor**: empresa que vende produtos para a unidade
- **Produto**: item comprável (ingrediente, insumo)
- **Requisição**: pedido de compra/cotação
- **Requisição Automática**: regra recorrente que gera requisições automaticamente
- **Lista de compra**: agregação de itens a comprar
- **Estoque**: inventário com entradas/saídas
- **Pedido**: requisição efetivada (ordem de compra)
- **Economia gerada**: diferença entre valor previsto/cotado e valor pago

---

_Documento em construção — atualizado a cada nova tela mapeada._
