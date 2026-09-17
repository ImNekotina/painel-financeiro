"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Leitura de estado do DOM (classe .dark) só é segura após o mount,
    // para evitar divergência de hidratação entre servidor e cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pf-theme", next ? "dark" : "light");
    } catch {
      // localStorage indisponível (ex.: modo privado) — tema não persiste, sem quebrar a UI.
    }
    setIsDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema claro/escuro"
      className={cn(
        "flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
        className
      )}
    >
      {isDark === null ? null : isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  );
}
