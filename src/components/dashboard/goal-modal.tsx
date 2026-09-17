"use client";

import { useActionState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { createGoalAction, updateGoalAction } from "@/actions/goals";
import type { ActionResult } from "@/actions/auth";
import type { GoalCardData } from "@/components/dashboard/goal-card";
import { centsToReais } from "@/lib/money";

const initialState: ActionResult | null = null;

function toInputDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function toBRAmount(cents: number) {
  if (!cents) return "";
  return centsToReais(cents).toFixed(2).replace(".", ",");
}

/**
 * Este componente deve ser montado condicionalmente pelo pai
 * (`{open && <GoalModal ... />}`) em vez de receber um prop `open` que
 * alterna — assim cada abertura é um mount novo com estado correto.
 */
export function GoalModal({
  onClose,
  goal,
}: {
  onClose: () => void;
  goal?: GoalCardData;
}) {
  const action = goal ? updateGoalAction.bind(null, goal.id) : createGoalAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const err = state && !state.success ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state?.success) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal open onClose={onClose} title={goal ? "Editar meta" : "Nova meta"}>
      <form action={formAction} className="space-y-4" noValidate>
        {state && !state.success && !err && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {state.message}
          </div>
        )}

        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required placeholder="Ex.: Guardar para um PC novo" defaultValue={goal?.title} error={err?.title?.[0]} />
          <FieldError messages={err?.title} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="targetAmount">Valor objetivo (R$)</Label>
            <Input id="targetAmount" name="targetAmount" required inputMode="decimal" placeholder="5.000,00" defaultValue={goal ? toBRAmount(goal.targetAmountCents) : ""} error={err?.targetAmount?.[0]} />
            <FieldError messages={err?.targetAmount} />
          </div>
          <div>
            <Label htmlFor="currentAmount">Valor atual (R$)</Label>
            <Input id="currentAmount" name="currentAmount" inputMode="decimal" placeholder="0,00" defaultValue={goal ? toBRAmount(goal.currentAmountCents) : ""} error={err?.currentAmount?.[0]} />
            <FieldError messages={err?.currentAmount} />
          </div>
        </div>

        <div>
          <Label htmlFor="deadline">Prazo (opcional)</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={goal ? toInputDate(goal.deadline) : ""} error={err?.deadline?.[0]} />
          <FieldError messages={err?.deadline} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {goal ? "Salvar" : "Criar meta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
