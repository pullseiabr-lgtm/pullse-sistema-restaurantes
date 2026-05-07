// Tipos compartilhados entre backend e frontend.
// Quando o backend rodar, prefira gerar os tipos a partir do schema Prisma
// (ex: importar de @prisma/client) — este arquivo é apenas para contratos
// não cobertos pelo Prisma (DTOs de input/output, enums adicionais, etc.).

export type Pagination<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type ApiError = {
  statusCode: number;
  message: string | string[];
  code?: string;
  path?: string;
  timestamp?: string;
};
