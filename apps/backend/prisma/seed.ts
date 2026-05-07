/**
 * Seed idempotente — cria o usuário SUPERADMIN inicial.
 * Pode ser executado múltiplas vezes sem efeitos colaterais.
 *
 * Uso:
 *   SUPERADMIN_EMAIL=admin@empresa.com.br \
 *   SUPERADMIN_PASSWORD=SenhaForte@2026 \
 *   SUPERADMIN_NAME="Super Admin" \
 *   pnpm db:seed
 */

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const SUPERADMIN_EMAIL =
    process.env.SUPERADMIN_EMAIL ?? 'admin@empresa.com.br';
  const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
  const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME ?? 'Super Admin';

  if (!SUPERADMIN_PASSWORD) {
    throw new Error(
      'SUPERADMIN_PASSWORD não definido. Forneça via variável de ambiente.',
    );
  }

  if (SUPERADMIN_PASSWORD.length < 12) {
    throw new Error(
      'SUPERADMIN_PASSWORD deve ter no mínimo 12 caracteres.',
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: SUPERADMIN_EMAIL },
  });

  if (existing) {
    console.log(
      `[seed] Superadmin "${SUPERADMIN_EMAIL}" já existe. Pulando criação.`,
    );
    return;
  }

  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

  const superadmin = await prisma.user.create({
    data: {
      name: SUPERADMIN_NAME,
      email: SUPERADMIN_EMAIL,
      passwordHash,
      role: Role.SUPERADMIN,
      isActive: true,
    },
  });

  console.log(`[seed] Superadmin criado com sucesso: ${superadmin.email}`);
  console.log(
    '[seed] ATENÇÃO: altere a senha imediatamente após o primeiro login.',
  );
}

main()
  .catch((error) => {
    console.error('[seed] erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
