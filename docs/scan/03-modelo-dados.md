# Foozi — Modelo de Dados (inferido)

> Schema inferido a partir do escaneamento da UI. Versão inicial baseada em sample focado de 3 entidades-chave: Fornecedor, Produto, Requisição.

## Multi-tenancy

Hierarquia confirmada na UI:

```
Tenant (Organização)        ex: FLOWPAIVA
  └── Filial / Loja          ex: AMORE COSTA DOURADA
       └── operações (requisições, estoque, etc.)
```

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  stores    Store[]

  @@map("tenants")
}

model Store {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  name      String
  // demais campos a mapear (CNPJ, endereço, etc.)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@index([tenantId])
  @@map("stores")
}
```

## Fornecedor (Supplier)

Form `/fornecedores/novo` tem 3 abas: Dados do fornecedor, Pagamento, Comercial.

### Campos identificados

| Aba | Campo | Tipo | Obrig | Notas |
|-----|-------|------|-------|-------|
| Dados | Imagem | file (JPG/PNG/WEBP) | não | Storage (Supabase Storage) |
| Dados | Nome do fornecedor | string | sim | Display name |
| Dados | Razão social | string | sim | Legal name |
| Dados | Categorias | string[] (multi) | — | Tags/taxonomia |
| Dados | CNPJ | string | não | Validação BR (14 dígitos) |
| Dados | Organizações | Tenant[] (multi) | — | Em quais tenants o fornecedor está disponível |
| Dados | Fornecedor público | bool | — | Compartilhado entre tenants |
| Pagamento | Valor do pedido mínimo | decimal (BRL) | — | Min order value |
| Pagamento | Prazo de pagamento | string (free) | — | Ex.: "10 Dias", "30/60/90" |
| Pagamento | Prazo de entrega | int (days) | — | Lead time |
| Pagamento | Dias de entrega | enum[] (DOW) | — | Seg–Dom, multi-select |
| Comercial | Representantes (Agentes) | SupplierAgent[] | — | Relação 1:N |

### Schema Prisma proposto

```prisma
enum DayOfWeek {
  MON
  TUE
  WED
  THU
  FRI
  SAT
  SUN
}

model Supplier {
  id              String           @id @default(uuid())
  // Multi-tenant: público (ownerTenantId null) ou exclusivo
  ownerTenantId   String?          @map("owner_tenant_id")
  ownerTenant     Tenant?          @relation("SupplierOwner", fields: [ownerTenantId], references: [id])
  isPublic        Boolean          @default(false) @map("is_public")

  name            String           // nome de exibição
  legalName       String           @map("legal_name") // razão social
  cnpj            String?          @unique // 14 dígitos sem máscara
  imageUrl        String?          @map("image_url") // Supabase Storage path
  isActive        Boolean          @default(true) @map("is_active")

  // Pagamento
  minimumOrderValue Decimal?       @map("minimum_order_value") @db.Decimal(12, 2)
  paymentTerms      String?        @map("payment_terms") // free text "10 dias"
  deliveryLeadDays  Int?           @map("delivery_lead_days")
  deliveryDays      DayOfWeek[]    @map("delivery_days")

  categories      SupplierCategory[]
  organizations   SupplierTenantAccess[] // Tenants que enxergam este fornecedor
  agents          SupplierAgent[]

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")
  deletedAt       DateTime?        @map("deleted_at")

  @@index([ownerTenantId])
  @@map("suppliers")
}

model Category {
  id        String              @id @default(uuid())
  name      String              @unique
  suppliers SupplierCategory[]
  products  ProductCategory[]
  @@map("categories")
}

model SupplierCategory {
  supplierId String   @map("supplier_id")
  categoryId String   @map("category_id")
  supplier   Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id])

  @@id([supplierId, categoryId])
  @@map("supplier_categories")
}

model SupplierTenantAccess {
  supplierId String   @map("supplier_id")
  tenantId   String   @map("tenant_id")
  supplier   Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  tenant     Tenant   @relation(fields: [tenantId], references: [id])

  @@id([supplierId, tenantId])
  @@map("supplier_tenant_access")
}

model SupplierAgent {
  id         String   @id @default(uuid())
  supplierId String   @map("supplier_id")
  supplier   Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  name       String
  email      String?
  phone      String?
  // demais campos a mapear ao expandir o formulário

  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([supplierId])
  @@map("supplier_agents")
}
```

## Produto (Product)

Catálogo global compartilhado entre tenants. **59.257 produtos** já cadastrados no ambiente observado. Edição direta requer permissão elevada (tentativa de `/produtos/{id}/editar` redirecionou para `/`).

### Campos identificados

| Origem | Campo | Tipo | Notas |
|--------|-------|------|-------|
| Lista | name | string | Ex.: "SALGADINHO TORCIDA SABOR QUEIJO 60G" |
| Lista | description | string | Texto secundário; às vezes igual ao nome, às vezes detalhe |
| Lista | unitOfMeasure | enum | Unidade, Quilograma, Caixa, Rolo (provavel: Litro, Grama, Pacote) |
| Lista | imageUrl | string | Imagem opcional |
| Dashboard | brand | string | "Marca" — coluna do detalhamento |
| Dashboard | marketAveragePrice | decimal | Preço de mercado calculado pelo Foozi |
| Dashboard | barcode (provavel) | string | Comum em catálogo |
| Dashboard | category | Category | Reuso da entidade Category |

### Schema Prisma proposto

```prisma
enum UnitOfMeasure {
  UNIT       // Unidade
  KILOGRAM   // Quilograma
  GRAM       // Grama
  LITER      // Litro
  MILLILITER // Mililitro
  BOX        // Caixa
  ROLL       // Rolo
  PACKAGE    // Pacote
  METER      // Metro
  // expandir conforme catálogo
}

model Product {
  id              String     @id @default(cuid())
  name            String
  description     String?    @db.Text
  brand           String?
  barcode         String?    @unique
  unitOfMeasure   UnitOfMeasure @map("unit_of_measure")
  imageUrl        String?    @map("image_url")
  // Preço de mercado (mantido pelo Foozi central)
  marketPrice     Decimal?   @map("market_price") @db.Decimal(12, 4)
  // Catálogo público (true) ou customizado por tenant (false → ownerTenantId not null)
  isPublic        Boolean    @default(true) @map("is_public")
  ownerTenantId   String?    @map("owner_tenant_id")
  ownerTenant     Tenant?    @relation(fields: [ownerTenantId], references: [id])

  categories      ProductCategory[]
  suppliers       SupplierProduct[]
  requisitionItems RequisitionItem[]

  isActive        Boolean    @default(true) @map("is_active")
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")
  deletedAt       DateTime?  @map("deleted_at")

  @@index([brand])
  @@index([ownerTenantId])
  @@map("products")
}

model ProductCategory {
  productId  String   @map("product_id")
  categoryId String   @map("category_id")
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id])

  @@id([productId, categoryId])
  @@map("product_categories")
}

// Relação supplier ↔ product (catálogo do fornecedor com preço/min order)
model SupplierProduct {
  id          String   @id @default(uuid())
  supplierId  String   @map("supplier_id")
  productId   String   @map("product_id")
  supplier    Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  price       Decimal  @db.Decimal(12, 4)
  minQuantity Decimal? @map("min_quantity") @db.Decimal(12, 4)
  // skuFornecedor, codigoEmbarque, etc. a mapear

  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([supplierId, productId])
  @@map("supplier_products")
}
```

### Métricas/KPIs derivados (não persistidos diretamente)

- `Pedidos` — count(orders.id) where product
- `Quantidade Total` — sum(orderItems.quantity)
- `Preço Médio Pago` — avg(orderItems.unitPrice)
- `Preço Médio Mercado` — Product.marketPrice (snapshot histórico recomendado)
- `Economia Unitária` — marketPrice − avgPaid
- `Total Economizado` — economiaUnitaria × quantidadeTotal

Recomendação: criar **MaterializedView** ou tabela `product_period_metrics` populada por job/cron.

## Requisição (Requisition / RFQ)

**Conceito:** uma "requisição" é um pedido de cotação (RFQ) gerado por uma filial e enviado para um ou mais fornecedores. Eles respondem com preços; a filial escolhe e o pedido vira ordem de compra.

### Páginas mapeadas

| Rota | Função |
|------|--------|
| `/requisicoes/minhas` | Requisições ativas do usuário |
| `/requisicoes/nova?criar=true` | Wizard de criação |
| `/requisicoes/historico` | Requisições finalizadas/canceladas |

### Wizard de criação (4 etapas)

1. **Filial** — escolher para qual filial a cotação será gerada
2. **Dados** — metadados (nome, prazo, observações, comprador, prioridade, etc.)
3. **Lista de compra** — opcionalmente importar itens de uma `ShoppingList` existente
4. **Produtos** — adicionar/ajustar itens linha-a-linha

Botão "Salvar como rascunho" no header → estado **DRAFT** existe.

### Estados inferidos

| Estado | Descrição |
|--------|-----------|
| `DRAFT` | Rascunho |
| `OPEN` | Enviada aos fornecedores, aguardando cotações |
| `RECEIVING_QUOTES` | Recebendo respostas |
| `IN_REVIEW` | Comprador analisando |
| `APPROVED` | Item(ns) selecionado(s) → pronto para virar pedido |
| `ORDERED` | Pedido(s) emitido(s) |
| `RECEIVED` | Mercadoria recebida |
| `CANCELLED` | Cancelada |
| `FINISHED` | Finalizada (vai pro Histórico) |

### Schema Prisma proposto

```prisma
enum RequisitionStatus {
  DRAFT
  OPEN
  RECEIVING_QUOTES
  IN_REVIEW
  APPROVED
  ORDERED
  RECEIVED
  CANCELLED
  FINISHED
}

model Requisition {
  id              String              @id @default(cuid())
  // Multi-tenancy: requisição pertence a uma Store (filial)
  storeId         String              @map("store_id")
  store           Store               @relation(fields: [storeId], references: [id])

  code            String              @unique // ex: REQ-2026-00042 (gerado)
  name            String?
  status          RequisitionStatus   @default(DRAFT)

  // Quem criou
  createdById     String              @map("created_by_id")
  createdBy       User                @relation("RequisitionCreatedBy", fields: [createdById], references: [id])
  // Comprador atribuído
  buyerId         String?             @map("buyer_id")
  buyer           User?               @relation("RequisitionBuyer", fields: [buyerId], references: [id])

  // Origem opcional: foi criada a partir de uma ShoppingList
  shoppingListId  String?             @map("shopping_list_id")
  shoppingList    ShoppingList?       @relation(fields: [shoppingListId], references: [id])

  notes           String?             @db.Text
  priority        Int                 @default(0)
  dueDate         DateTime?           @map("due_date")

  items           RequisitionItem[]
  quotes          Quote[]

  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")
  submittedAt     DateTime?           @map("submitted_at")
  cancelledAt     DateTime?           @map("cancelled_at")
  finishedAt     DateTime?           @map("finished_at")
  deletedAt       DateTime?           @map("deleted_at")

  @@index([storeId])
  @@index([status])
  @@map("requisitions")
}

model RequisitionItem {
  id              String              @id @default(uuid())
  requisitionId   String              @map("requisition_id")
  requisition     Requisition         @relation(fields: [requisitionId], references: [id], onDelete: Cascade)

  productId       String              @map("product_id")
  product         Product             @relation(fields: [productId], references: [id])

  quantity        Decimal             @db.Decimal(12, 4)
  unitOfMeasure   UnitOfMeasure       @map("unit_of_measure")
  notes           String?

  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  @@index([requisitionId])
  @@index([productId])
  @@map("requisition_items")
}

// Cotação enviada por um fornecedor para uma requisição
model Quote {
  id              String              @id @default(uuid())
  requisitionId   String              @map("requisition_id")
  requisition     Requisition         @relation(fields: [requisitionId], references: [id], onDelete: Cascade)
  supplierId      String              @map("supplier_id")
  supplier        Supplier            @relation(fields: [supplierId], references: [id])

  status          QuoteStatus         @default(PENDING)
  validUntil      DateTime?           @map("valid_until")
  totalAmount     Decimal?            @map("total_amount") @db.Decimal(12, 2)
  notes           String?

  items           QuoteItem[]

  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")
  submittedAt     DateTime?           @map("submitted_at")

  @@unique([requisitionId, supplierId])
  @@map("quotes")
}

enum QuoteStatus {
  PENDING
  RECEIVED
  WON         // Selecionada
  LOST        // Não selecionada
  EXPIRED
}

model QuoteItem {
  id                String       @id @default(uuid())
  quoteId           String       @map("quote_id")
  quote             Quote        @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  requisitionItemId String       @map("requisition_item_id")
  requisitionItem   RequisitionItem @relation(fields: [requisitionItemId], references: [id])

  unitPrice         Decimal      @map("unit_price") @db.Decimal(12, 4)
  availableQuantity Decimal?     @map("available_quantity") @db.Decimal(12, 4)
  isSelected        Boolean      @default(false) @map("is_selected")
  notes             String?

  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  @@index([quoteId])
  @@map("quote_items")
}

// Lista de compra - origem opcional para Requisição
model ShoppingList {
  id           String              @id @default(cuid())
  storeId      String              @map("store_id")
  store        Store               @relation(fields: [storeId], references: [id])
  name         String
  description  String?
  items        ShoppingListItem[]
  requisitions Requisition[]

  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")
  deletedAt    DateTime?           @map("deleted_at")

  @@index([storeId])
  @@map("shopping_lists")
}

model ShoppingListItem {
  id              String        @id @default(uuid())
  shoppingListId  String        @map("shopping_list_id")
  shoppingList    ShoppingList  @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  productId       String        @map("product_id")
  product         Product       @relation(fields: [productId], references: [id])
  quantity        Decimal       @db.Decimal(12, 4)
  unitOfMeasure   UnitOfMeasure @map("unit_of_measure")

  @@map("shopping_list_items")
}
```

### Endereço da Filial (Store) — exposto na UI

```prisma
model StoreAddress {
  id          String  @id @default(uuid())
  storeId     String  @unique @map("store_id")
  store       Store   @relation(fields: [storeId], references: [id], onDelete: Cascade)

  street      String  // "Rodovia PE-60"
  number      String  // "320"
  complement  String? // "LOJA 127"
  neighborhood String? // "Garapu" (talvez)
  city        String  // "Cabo de Santo Agostinho"
  state       String  @db.Char(2) // "PE"
  zipCode     String  @map("zip_code") // "54518-343"
  country     String  @default("BR") @db.Char(2)

  @@map("store_addresses")
}
```

## Outras entidades observadas (TODO)

- **Requisição Automática** (cron/regra recorrente)
- **Lista de compra**
- **Estoque** (entrada, saída, saldo)
- **Pedido** (requisição efetivada)
- **Webhook** (eventos)
- **Integração**
- **Notificação**
- **API Key** (já mapeado em `02-api-publica.md`)

Cada um vira um módulo NestJS na Fase 4. Para o bootstrap inicial, partimos de `User`, `Tenant`, `Store`, `Supplier`, `Product`, `Requisition` e expandimos depois.
