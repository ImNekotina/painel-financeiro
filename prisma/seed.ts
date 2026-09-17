/**
 * ============================================================================
 * SEED DE DESENVOLVIMENTO — NÃO USE EM PRODUÇÃO
 * ============================================================================
 * Este script cria um usuário de demonstração com dados financeiros
 * FICTÍCIOS, apenas para facilitar testes locais. Nunca execute este
 * script contra um banco de produção.
 *
 * Uso: npm run db:seed
 * ============================================================================
 */
import { PrismaClient, type Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@painelfinanceiro.dev";
const DEMO_PASSWORD = "Demo1234"; // Apenas para desenvolvimento local.

async function main() {
  console.log("Iniciando seed de desenvolvimento...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: "Usuário Demo",
      email: DEMO_EMAIL,
      passwordHash,
    },
  });

  const categoriesData = [
    { name: "Alimentação", color: "#f59e0b" },
    { name: "Transporte", color: "#3b82f6" },
    { name: "Moradia", color: "#8b5cf6" },
    { name: "Lazer", color: "#ec4899" },
    { name: "Saúde", color: "#10b981" },
    { name: "Educação", color: "#06b6d4" },
    { name: "Assinaturas", color: "#6366f1" },
    { name: "Outros", color: "#64748b" },
  ];

  const categories: Category[] = [];
  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: c.name } },
      update: {},
      create: { userId: user.id, name: c.name, color: c.color },
    });
    categories.push(category);
  }

  const byName = (name: string) => categories.find((c) => c.name === name)!.id;

  // Limpa transações/metas antigas do usuário demo para reexecuções idempotentes.
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const transactions: {
    type: "INCOME" | "EXPENSE";
    amountCents: number;
    description: string;
    categoryId: string | null;
    date: Date;
  }[] = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - monthOffset, 5);

    transactions.push({
      type: "INCOME",
      amountCents: 600000, // R$ 6.000,00
      description: "Salário",
      categoryId: null,
      date: ref,
    });

    transactions.push({
      type: "EXPENSE",
      amountCents: 120000 + Math.floor(Math.random() * 20000),
      description: "Aluguel",
      categoryId: byName("Moradia"),
      date: new Date(ref.getFullYear(), ref.getMonth(), 10),
    });
    transactions.push({
      type: "EXPENSE",
      amountCents: 45000 + Math.floor(Math.random() * 15000),
      description: "Supermercado",
      categoryId: byName("Alimentação"),
      date: new Date(ref.getFullYear(), ref.getMonth(), 15),
    });
    transactions.push({
      type: "EXPENSE",
      amountCents: 18000 + Math.floor(Math.random() * 8000),
      description: "Transporte / combustível",
      categoryId: byName("Transporte"),
      date: new Date(ref.getFullYear(), ref.getMonth(), 18),
    });
    transactions.push({
      type: "EXPENSE",
      amountCents: 8990,
      description: "Assinatura streaming",
      categoryId: byName("Assinaturas"),
      date: new Date(ref.getFullYear(), ref.getMonth(), 20),
    });
    transactions.push({
      type: "EXPENSE",
      amountCents: 12000 + Math.floor(Math.random() * 10000),
      description: "Lazer / restaurante",
      categoryId: byName("Lazer"),
      date: new Date(ref.getFullYear(), ref.getMonth(), 22),
    });
  }

  await prisma.transaction.createMany({
    data: transactions.map((t) => ({ ...t, userId: user.id })),
  });

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Guardar para um PC novo",
        targetAmountCents: 500000,
        currentAmountCents: 180000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      },
      {
        userId: user.id,
        title: "Reserva de emergência",
        targetAmountCents: 1500000,
        currentAmountCents: 620000,
        deadline: null,
      },
      {
        userId: user.id,
        title: "Viagem de fim de ano",
        targetAmountCents: 300000,
        currentAmountCents: 300000,
        deadline: new Date(now.getFullYear(), 11, 1),
      },
    ],
  });

  console.log("Seed concluído.");
  console.log(`Usuário demo: ${DEMO_EMAIL} / senha: ${DEMO_PASSWORD}`);
  console.log("Lembrete: estes são dados fictícios para desenvolvimento, não use em produção.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
