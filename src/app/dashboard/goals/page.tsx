import type { Metadata } from "next";
import { Target } from "lucide-react";
import { getGoals } from "@/lib/data";
import { GoalCard } from "@/components/dashboard/goal-card";
import { NewGoalButton } from "@/components/dashboard/new-goal-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Metas — Painel Financeiro" };

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Metas de economia
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Defina objetivos e acompanhe seu progresso.
          </p>
        </div>
        <NewGoalButton />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Você ainda não possui metas."
          description='Ex.: "Guardar R$ 5.000 para comprar um PC".'
          action={<NewGoalButton />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
