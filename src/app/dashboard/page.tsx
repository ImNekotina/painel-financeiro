import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ExpenseDistributionChart } from "@/components/dashboard/expense-distribution-chart";
import { GoalCard } from "@/components/dashboard/goal-card";
import { NewGoalButton } from "@/components/dashboard/new-goal-button";
import { NewTransactionButton } from "@/components/dashboard/new-transaction-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatBRL, formatDateBR } from "@/lib/money";

export const metadata: Metadata = { title: "Visão geral — Painel Financeiro" };

export default async function DashboardPage() {
  const data = await getDashboardData();
  const firstName = data.user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Olá, {firstName}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Veja como estão suas finanças hoje.
          </p>
        </div>
        <NewTransactionButton
          categories={data.categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>

      <SummaryCards
        balanceCents={data.balanceCents}
        monthIncomeCents={data.monthIncomeCents}
        monthExpenseCents={data.monthExpenseCents}
        monthSavingsCents={data.monthSavingsCents}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={data.monthlySeries} />
        </div>
        <ExpenseDistributionChart data={data.expenseDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Últimas transações</CardTitle>
              <Link
                href="/dashboard/transactions"
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
              >
                Ver todas <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>
            {data.recentTransactions.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Você ainda não possui transações."
                description="Adicione sua primeira receita ou despesa para começar."
                action={
                  <NewTransactionButton
                    categories={data.categories.map((c) => ({ id: c.id, name: c.name }))}
                    label="Adicionar transação"
                  />
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentTransactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {t.description}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-slate-400">{formatDateBR(t.date)}</span>
                        {t.category && <Badge color={t.category.color}>{t.category.name}</Badge>}
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 pl-3 text-sm font-semibold " +
                        (t.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")
                      }
                    >
                      {t.type === "INCOME" ? "+" : "-"} {formatBRL(t.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Metas de economia
            </h2>
            <NewGoalButton />
          </div>
          {data.goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhuma meta criada ainda."
              description="Crie uma meta para acompanhar seu progresso."
            />
          ) : (
            <div className="space-y-3">
              {data.goals.slice(0, 3).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
