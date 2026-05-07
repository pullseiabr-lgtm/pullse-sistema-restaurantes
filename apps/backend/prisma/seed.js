"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? 'admin@empresa.com.br';
    const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
    const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME ?? 'Super Admin';
    if (!SUPERADMIN_PASSWORD) {
        throw new Error('SUPERADMIN_PASSWORD não definido. Forneça via variável de ambiente.');
    }
    if (SUPERADMIN_PASSWORD.length < 12) {
        throw new Error('SUPERADMIN_PASSWORD deve ter no mínimo 12 caracteres.');
    }
    const existing = await prisma.user.findUnique({
        where: { email: SUPERADMIN_EMAIL },
    });
    if (existing) {
        console.log(`[seed] Superadmin "${SUPERADMIN_EMAIL}" já existe. Pulando criação.`);
        return;
    }
    const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);
    const superadmin = await prisma.user.create({
        data: {
            name: SUPERADMIN_NAME,
            email: SUPERADMIN_EMAIL,
            passwordHash,
            role: client_1.Role.SUPERADMIN,
            isActive: true,
        },
    });
    console.log(`[seed] Superadmin criado com sucesso: ${superadmin.email}`);
    console.log('[seed] ATENÇÃO: altere a senha imediatamente após o primeiro login.');
}
main()
    .catch((error) => {
    console.error('[seed] erro:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map