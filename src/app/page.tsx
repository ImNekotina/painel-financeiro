import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PieChart, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-semibold">
            P
          </div>
          <span className="text-base font-semibold tracking-tight">Painel Financeiro</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-24 pt-10 text-center sm:pt-20">
        <span className="mb-5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Suas finanças, com clareza e privacidade
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Organize sua vida financeira em um painel só seu
        </h1>
        <p className="mt-5 max-w-xl text-balance text-slate-500 dark:text-slate-400">
          Registre receitas e despesas, acompanhe metas de economia e visualize
          para onde vai o seu dinheiro — tudo em um só lugar, protegido e
          privado.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-500"
          >
            Começar agora <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: TrendingUp,
              title: "Visão em tempo real",
              desc: "Saldo, receitas e despesas sempre atualizados.",
            },
            {
              icon: PieChart,
              title: "Gráficos claros",
              desc: "Entenda para onde vai seu dinheiro por categoria.",
            },
            {
              icon: Target,
              title: "Metas de economia",
              desc: "Defina objetivos e acompanhe o progresso.",
            },
            {
              icon: ShieldCheck,
              title: "Privado por padrão",
              desc: "Seus dados pertencem só a você — sempre.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <Icon className="size-4.5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        Painel Financeiro — projeto de demonstração.
      </footer>
    </div>
  );
}
