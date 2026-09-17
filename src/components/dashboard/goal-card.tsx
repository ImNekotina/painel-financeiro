"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL, formatDateBR } from "@/lib/money";
import { deleteGoalAction } from "@/actions/goals";
import { GoalModal } from "@/components/dashboard/goal-modal";

export interface GoalCardData {
  id: string;
  title: string;
  targetAmountCents: number;
  currentAmountCents: number;
  deadline: Date | null;
}

export function GoalCard({ goal }: { goal: GoalCardData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rawPercent = goal.targetAmountCents > 0
    ? (goal.currentAmountCents / goal.targetAmountCents) * 100
    : 0;
  const percent = Math.min(100, Math.max(0, rawPercent));

  function handleDelete() {
    if (!confirm(`Excluir a meta "${goal.title}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await deleteGoalAction(goal.id);
    });
  }

  return (
    <Card className="relative">
      <div className="flex items-start justify-between">
        <p className="pr-6 text-sm font-semibold text-slate-900 dark:text-slate-100">{goal.title}</p>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Mais opções"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setEditOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Pencil className="size-3.5" /> Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="size-3.5" /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {formatBRL(goal.currentAmountCents)}
        </span>
        <span className="text-slate-400">de {formatBRL(goal.targetAmountCents)}</span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{percent.toFixed(0)}% concluído</span>
        {goal.deadline && <span>Prazo: {formatDateBR(goal.deadline)}</span>}
      </div>

      {editOpen && <GoalModal onClose={() => setEditOpen(false)} goal={goal} />}
    </Card>
  );
}
