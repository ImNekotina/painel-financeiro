"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Tags,
  UserRound,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/dashboard/goals", label: "Metas", icon: Target },
  { href: "/dashboard/categories", label: "Categorias", icon: Tags },
  { href: "/dashboard/profile", label: "Perfil", icon: UserRound },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-semibold">
          P
        </div>
        <span className="text-base font-semibold tracking-tight">Painel Financeiro</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="min-w-0 px-2">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {userName}
          </p>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair"
              className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <LogOut className="size-4.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
