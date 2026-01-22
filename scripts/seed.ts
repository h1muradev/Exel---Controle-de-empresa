import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("Admin@123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@empresa.local" },
    update: {},
    create: {
      email: "admin@empresa.local",
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      mustResetPassword: true,
      permissions: {
        create: [{ permission: "VIEW_SENSITIVE" }]
      }
    }
  });

  await prisma.appConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      alertaDias: 30,
      retentionDays: 730,
      logRetentionDays: 180
    }
  });

  await prisma.company.create({
    data: {
      codigo: "EMP0001",
      apelido: "Empresa Exemplo",
      cnpj: "12345678000199",
      responsavel: "João Silva",
      tipoUnidade: "MATRIZ",
      status: "ATIVA",
      emiteNfe: true,
      emiteNfce: false,
      emiteIss: true,
      certificates: {
        create: [{ validade: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20) }]
      },
      notes: {
        create: [{ texto: "Primeira observação", createdByUserId: admin.id }]
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
