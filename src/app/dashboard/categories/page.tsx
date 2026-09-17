import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { getCategories } from "@/lib/data";
import { CategoryCard } from "@/components/dashboard/category-card";
import { NewCategoryButton } from "@/components/dashboard/new-category-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Categorias — Painel Financeiro" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Categorias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize suas transações por categoria personalizada.
          </p>
        </div>
        <NewCategoryButton />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria criada ainda."
          description="Crie categorias como Alimentação, Transporte ou Lazer."
          action={<NewCategoryButton />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
