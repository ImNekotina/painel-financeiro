"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function IncomeExpenseChart({
  data,
}: {
  data: { month: string; receitas: number; despesas: number }[];
}) {
  const hasData = data.some((d) => d.receitas > 0 || d.despesas > 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Receitas x despesas (6 meses)</CardTitle>
      </CardHeader>
      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-slate-400"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-slate-400"
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    Number(value)
                  )
                }
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              />
              <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Sem dados suficientes para exibir o gráfico ainda.
        </div>
      )}
    </Card>
  );
}
