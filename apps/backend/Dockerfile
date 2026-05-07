FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack disable && npm install -g pnpm@9.12.0

# Todos os package.json do workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json                                                    ./packages/shared/
COPY apps/backend/package.json apps/backend/nest-cli.json apps/backend/tsconfig.json ./apps/backend/
COPY apps/frontend/package.json                                                      ./apps/frontend/

RUN pnpm install --no-frozen-lockfile

# Código-fonte
COPY packages/shared/ ./packages/shared/
COPY apps/backend/src/ ./apps/backend/src/
COPY apps/backend/prisma/ ./apps/backend/prisma/

# Build NestJS + Prisma Client
RUN pnpm --filter @amore/backend build
RUN pnpm --filter @amore/backend prisma:generate

# ---- Imagem de produção ----
FROM node:22-alpine

WORKDIR /app

# Copia node_modules já instalados — evita re-instalar no runner
COPY --from=builder /app/node_modules          ./node_modules
COPY --from=builder /app/apps/backend/dist     ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma   ./apps/backend/prisma
COPY --from=builder /app/packages/shared/src   ./packages/shared/src
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/package.json          ./

EXPOSE 3001

CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/main.js"]
