FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack disable && npm install -g pnpm@9.12.0

# Manifests do monorepo (cache de layers)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json apps/backend/nest-cli.json apps/backend/tsconfig.json ./apps/backend/

RUN pnpm install --frozen-lockfile

# Código-fonte
COPY packages/shared/ ./packages/shared/
COPY apps/backend/src/ ./apps/backend/src/
COPY apps/backend/prisma/ ./apps/backend/prisma/

# Build NestJS
RUN pnpm --filter @amore/backend build

# Gera Prisma Client
RUN pnpm --filter @amore/backend prisma:generate

# ---- Imagem de produção ----
FROM node:22-alpine

WORKDIR /app

RUN corepack disable && npm install -g pnpm@9.12.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --prod

# Artefatos do build
COPY --from=builder /app/apps/backend/dist        ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma      ./apps/backend/prisma
COPY --from=builder /app/node_modules/.prisma     ./node_modules/.prisma
COPY --from=builder /app/packages/shared/src      ./packages/shared/src

EXPOSE 3001

CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && cd /app && node apps/backend/dist/main.js"]
