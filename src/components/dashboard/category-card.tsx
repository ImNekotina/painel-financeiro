"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { deleteCategoryAction } from "@/actions/categories";
import { CategoryModal } from "@/components/dashboard/category-modal";

export interface CategoryCardData {
  id: string;
  name: string;
  color: string;
  _count: { transactions: number };
}

export function CategoryCard({ category }: { category: CategoryCardData }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const msg =
      category._count.transactions > 0
        ? `Esta categoria possui ${category._count.transactions} transação(ões) vinculada(s). Elas ficarão sem categoria. Deseja continuar?`
        : `Excluir a categoria "${category.name}"?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteCategoryAction(category.id);
    });
  }

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{category.name}</p>
          <p className="text-xs text-slate-400">
            {category._count.transactions} transaç{category._count.transactions === 1 ? "ão" : "ões"}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Editar categoria"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Excluir categoria"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      {editOpen && <CategoryModal onClose={() => setEditOpen(false)} category={category} />}
    </Card>
  );
}
