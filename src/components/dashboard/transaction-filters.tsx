"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function TransactionFiltersBar({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative lg:col-span-2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por descrição..."
          defaultValue={searchParams.get("search") ?? ""}
          className="pl-9"
          onChange={(e) => updateParam("search", e.target.value)}
        />
      </div>
      <Select
        defaultValue={searchParams.get("type") ?? "ALL"}
        onChange={(e) => updateParam("type", e.target.value)}
      >
        <option value="ALL">Todos os tipos</option>
        <option value="INCOME">Receitas</option>
        <option value="EXPENSE">Despesas</option>
      </Select>
      <Select
        defaultValue={searchParams.get("categoryId") ?? "ALL"}
        onChange={(e) => updateParam("categoryId", e.target.value)}
      >
        <option value="ALL">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          aria-label="Data inicial"
          defaultValue={searchParams.get("startDate") ?? ""}
          onChange={(e) => updateParam("startDate", e.target.value)}
        />
        <Input
          type="date"
          aria-label="Data final"
          defaultValue={searchParams.get("endDate") ?? ""}
          onChange={(e) => updateParam("endDate", e.target.value)}
        />
      </div>
    </div>
  );
}
