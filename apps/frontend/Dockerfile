FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack disable && npm install -g pnpm@9.12.0

# Todos os package.json do workspace (pnpm exige todos para resolver o lockfile)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/package.json                                                   ./packages/shared/
COPY apps/backend/package.json                                                      ./apps/backend/
COPY apps/frontend/package.json apps/frontend/tsconfig.json                        ./apps/frontend/
COPY apps/frontend/vite.config.ts apps/frontend/index.html                         ./apps/frontend/
COPY apps/frontend/postcss.config.js apps/frontend/tailwind.config.js              ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ ./packages/shared/
COPY apps/frontend/src/ ./apps/frontend/src/

# VITE_API_URL é relativa — Nginx faz o proxy para o backend
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @amore/frontend build

# ---- Imagem final ----
FROM nginx:1.27-alpine

COPY --from=builder /app/apps/frontend/dist  /usr/share/nginx/html
COPY apps/frontend/nginx.conf                /etc/nginx/conf.d/default.conf

EXPOSE 80
