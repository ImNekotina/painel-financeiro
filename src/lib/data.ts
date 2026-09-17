import "server-only";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { TransactionFilters } from "@/schemas/transaction";

/**
 * Todas as funções abaixo obtêm o usuário autenticado internamente via
 * `requireUser()` (derivado da sessão no servidor) e usam `userId` em
 * TODAS as cláusulas WHERE. Nenhuma função aceita um `userId` externo —
 * isso elimina por construção a possibilidade de vazamento entre contas.
 */

export async function getDashboardData() {
  const user = await requireUser();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [allTransactions, monthTransactions, goals, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      select: { type: true, amountCents: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  const balanceCents = allTransactions.reduce(
    (sum, t) => sum + (t.type === "INCOME" ? t.amountCents : -t.amountCents),
    0
  );

  const monthIncomeCents = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const monthExpenseCents = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCents, 0);

  const monthSavingsCents = monthIncomeCents - monthExpenseCents;

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  // Últimos 6 meses de receitas x despesas.
  const monthlySeries: { month: string; receitas: number; despesas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const refDate = subMonths(now, i);
    const start = startOfMonth(refDate);
    const end = endOfMonth(refDate);
    const monthTx = await prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
      select: { type: true, amountCents: true },
    });
    const receitas = monthTx
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amountCents, 0);
    const despesas = monthTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amountCents, 0);
    monthlySeries.push({
      month: format(refDate, "MMM"),
      receitas: receitas / 100,
      despesas: despesas / 100,
    });
  }

  // Distribuição de gastos por categoria (mês atual).
  const expenseByCategory = new Map<string, { name: string; color: string; total: number }>();
  for (const t of monthTransactions) {
    if (t.type !== "EXPENSE") continue;
    const key = t.category?.id ?? "sem-categoria";
    const name = t.category?.name ?? "Sem categoria";
    const color = t.category?.color ?? "#94a3b8";
    const current = expenseByCategory.get(key) ?? { name, color, total: 0 };
    current.total += t.amountCents / 100;
    expenseByCategory.set(key, current);
  }

  return {
    user,
    balanceCents,
    monthIncomeCents,
    monthExpenseCents,
    monthSavingsCents,
    goals,
    categories,
    recentTransactions,
    monthlySeries,
    expenseDistribution: Array.from(expenseByCategory.values()),
  };
}

export async function getTransactions(filters: TransactionFilters) {
  const user = await requireUser();

  const where = {
    userId: user.id,
    ...(filters.type !== "ALL" ? { type: filters.type } : {}),
    ...(filters.categoryId !== "ALL" ? { categoryId: filters.categoryId } : {}),
    ...(filters.startDate || filters.endDate
      ? {
          date: {
            ...(filters.startDate ? { gte: filters.startDate } : {}),
            ...(filters.endDate ? { lte: filters.endDate } : {}),
          },
        }
      : {}),
    ...(filters.search
      ? { description: { contains: filters.search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getCategories() {
  const user = await requireUser();
  return prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  });
}

export async function getGoals() {
  const user = await requireUser();
  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
