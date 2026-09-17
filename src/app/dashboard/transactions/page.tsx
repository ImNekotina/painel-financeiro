import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { getTransactions } from "@/lib/data";
import { getCategories } from "@/lib/data";
import { transactionFiltersSchema } from "@/schemas/transaction";
import { TransactionFiltersBar } from "@/components/dashboard/transaction-filters";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { NewTransactionButton } from "@/components/dashboard/new-transaction-button";
import { Pagination } from "@/components/dashboard/pagination";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Transações — Painel Financeiro" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(rawParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );

  const filters = transactionFiltersSchema.parse(flat);
  const [{ items, total, page, pageSize }, categories] = await Promise.all([
    getTransactions(filters),
    getCategories(),
  ]);

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Transações
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Histórico completo de receitas e despesas.
          </p>
        </div>
        <NewTransactionButton categories={categoryOptions} label="Nova transação" />
      </div>

      <Card>
        <div className="mb-4">
          <TransactionFiltersBar categories={categoryOptions} />
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhuma transação encontrada."
            description="Tente ajustar os filtros ou adicione uma nova transação."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="pb-2 pr-4 font-medium">Data</th>
                  <th className="pb-2 pr-4 font-medium">Descrição</th>
                  <th className="pb-2 pr-4 font-medium">Categoria</th>
                  <th className="pb-2 pr-4 text-right font-medium">Valor</th>
                  <th className="pb-2 pl-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <TransactionRow key={t.id} transaction={t} categories={categoryOptions} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination page={page} pageSize={pageSize} total={total} />
        </div>
      </Card>
    </div>
  );
}
