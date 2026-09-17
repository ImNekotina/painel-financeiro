import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export function SummaryCards({
  balanceCents,
  monthIncomeCents,
  monthExpenseCents,
  monthSavingsCents,
}: {
  balanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthSavingsCents: number;
}) {
  const items = [
    {
      label: "Saldo",
      value: balanceCents,
      icon: Wallet,
      tone: "text-slate-900 dark:text-slate-100",
      iconTone: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      label: "Receitas do mês",
      value: monthIncomeCents,
      icon: TrendingUp,
      tone: "text-emerald-600 dark:text-emerald-400",
      iconTone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Despesas do mês",
      value: monthExpenseCents,
      icon: TrendingDown,
      tone: "text-red-500",
      iconTone: "bg-red-50 text-red-500 dark:bg-red-500/10",
    },
    {
      label: "Economia do mês",
      value: monthSavingsCents,
      icon: PiggyBank,
      tone: monthSavingsCents >= 0 ? "text-sky-600 dark:text-sky-400" : "text-red-500",
      iconTone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone, iconTone }) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight", tone)}>
                {formatBRL(value)}
              </p>
            </div>
            <div className={cn("flex size-9 items-center justify-center rounded-lg", iconTone)}>
              <Icon className="size-4.5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
