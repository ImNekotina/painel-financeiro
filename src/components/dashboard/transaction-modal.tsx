"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { createTransactionAction, updateTransactionAction } from "@/actions/transactions";
import type { ActionResult } from "@/actions/auth";
import { centsToReais } from "@/lib/money";
import { cn } from "@/lib/utils";

const initialState: ActionResult | null = null;

export interface TransactionModalCategory {
  id: string;
  name: string;
}

export interface TransactionModalData {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  description: string;
  categoryId: string | null;
  date: Date;
}

function toInputDate(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

function toBRAmount(cents: number) {
  if (!cents) return "";
  return centsToReais(cents).toFixed(2).replace(".", ",");
}

/**
 * Este componente deve ser montado condicionalmente pelo pai
 * (`{open && <TransactionModal ... />}`) em vez de receber um prop `open`
 * que alterna — assim cada abertura é um mount novo com estado correto,
 * sem precisar sincronizar estado via efeito.
 */
export function TransactionModal({
  onClose,
  categories,
  transaction,
}: {
  onClose: () => void;
  categories: TransactionModalCategory[];
  transaction?: TransactionModalData;
}) {
  const action = transaction
    ? updateTransactionAction.bind(null, transaction.id)
    : createTransactionAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? "EXPENSE");
  const err = state && !state.success ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal open onClose={onClose} title={transaction ? "Editar transação" : "Nova transação"}>
      <form action={formAction} className="space-y-4" noValidate>
        {state && !state.success && !err && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {state.message}
          </div>
        )}

        <div>
          <Label>Tipo</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                type === "INCOME"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-slate-200 text-slate-500 dark:border-slate-700"
              )}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                type === "EXPENSE"
                  ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "border-slate-200 text-slate-500 dark:border-slate-700"
              )}
            >
              Despesa
            </button>
          </div>
          <input type="hidden" name="type" value={type} />
          <FieldError messages={err?.type} />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" required placeholder="Ex.: Supermercado" defaultValue={transaction?.description} error={err?.description?.[0]} />
          <FieldError messages={err?.description} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" name="amount" required inputMode="decimal" placeholder="0,00" defaultValue={transaction ? toBRAmount(transaction.amountCents) : ""} error={err?.amount?.[0]} />
            <FieldError messages={err?.amount} />
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" required defaultValue={transaction ? toInputDate(transaction.date) : toInputDate(new Date())} error={err?.date?.[0]} />
            <FieldError messages={err?.date} />
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId">Categoria (opcional)</Label>
          <Select id="categoryId" name="categoryId" defaultValue={transaction?.categoryId ?? ""} error={err?.categoryId?.[0]}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <FieldError messages={err?.categoryId} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {transaction ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
