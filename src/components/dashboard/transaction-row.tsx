"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDateBR } from "@/lib/money";
import { deleteTransactionAction } from "@/actions/transactions";
import { TransactionModal, type TransactionModalCategory } from "@/components/dashboard/transaction-modal";

export interface TransactionRowData {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  description: string;
  date: Date;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
}

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: TransactionRowData;
  categories: TransactionModalCategory[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Excluir a transação "${transaction.description}"?`)) return;
    startTransition(async () => {
      await deleteTransactionAction(transaction.id);
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <td className="whitespace-nowrap py-3 pr-4 text-sm text-slate-500 dark:text-slate-400">
        {formatDateBR(transaction.date)}
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-slate-900 dark:text-slate-100">
        {transaction.description}
      </td>
      <td className="py-3 pr-4">
        {transaction.category ? (
          <Badge color={transaction.category.color}>{transaction.category.name}</Badge>
        ) : (
          <span className="text-xs text-slate-400">Sem categoria</span>
        )}
      </td>
      <td
        className={
          "py-3 pr-4 text-right text-sm font-semibold whitespace-nowrap " +
          (transaction.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")
        }
      >
        {transaction.type === "INCOME" ? "+" : "-"} {formatBRL(transaction.amountCents)}
      </td>
      <td className="py-3 pl-2 text-right">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Editar transação"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Excluir transação"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
      {editOpen && (
        <TransactionModal
          onClose={() => setEditOpen(false)}
          categories={categories}
          transaction={{
            id: transaction.id,
            type: transaction.type,
            amountCents: transaction.amountCents,
            description: transaction.description,
            categoryId: transaction.categoryId,
            date: transaction.date,
          }}
        />
      )}
    </tr>
  );
}
