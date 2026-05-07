# Foozi — API Pública

## Páginas relacionadas (UI)

| Rota | Função |
|------|--------|
| `/api/chaves-de-acesso` | Lista de API keys |
| `/api/chaves-de-acesso/criar` | Formulário de criação |
| `/api/webhooks` | Configuração de webhooks (a explorar) |
| `/api/integracoes` | Integrações de terceiros (a explorar) |

> **Importante:** essas rotas são **páginas Next.js** dentro do app, não a API REST em si. Servem para gerenciar credenciais/configurações da API pública. A documentação pública da API (Swagger/OpenAPI) **não está em `/api/docs`** (404). Tentar: `docs.foozi.com.br`, `developers.foozi.com.br`, ou link a partir do botão "Saiba mais" eventualmente presente nas páginas de API.

## Modelo da API Key

Formulário `/api/chaves-de-acesso/criar`:

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| Nome | string | sim | Identificação humana |
| Filial | select (uma loja) | sim | Escopo da chave = uma filial |
| Validade até | date `DD/MM/AAAA` | opcional? | Expiração |
| Chave de acesso Ativa | toggle (bool) | — | Default: ativa |

**Implicações para o schema replicado:**

```prisma
model ApiKey {
  id         String    @id @default(uuid())
  name       String
  // Hash do token. O token bruto é mostrado uma única vez ao criar.
  tokenHash  String    @unique @map("token_hash")
  storeId    String    @map("store_id")
  store      Store     @relation(fields: [storeId], references: [id])
  expiresAt  DateTime? @map("expires_at")
  isActive   Boolean   @default(true) @map("is_active")
  createdBy  String    @map("created_by")
  createdAt  DateTime  @default(now()) @map("created_at")
  revokedAt  DateTime? @map("revoked_at")

  @@index([storeId])
  @@map("api_keys")
}
```

**Observações de segurança:**
- API key escopada por **Filial** (não por tenant inteiro) — controle granular
- Sem seleção de scopes na UI → ou o sistema tem permissões uniformes por chave, ou os scopes são derivados do papel do usuário criador
- Webhooks separados das chaves → eventos provavelmente são enviados a URLs configuradas, autenticados via assinatura HMAC (padrão da indústria)
