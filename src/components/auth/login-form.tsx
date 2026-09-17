"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, type ActionResult } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";

const initialState: ActionResult | null = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.success && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@email.com"
          error={state && !state.success ? state.fieldErrors?.email?.[0] : undefined}
        />
        <FieldError messages={state && !state.success ? state.fieldErrors?.email : undefined} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-emerald-600 hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="pr-10"
            error={state && !state.success ? state.fieldErrors?.password?.[0] : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FieldError messages={state && !state.success ? state.fieldErrors?.password : undefined} />
      </div>

      <Button type="submit" isLoading={isPending} className="w-full">
        Entrar
      </Button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Não tem uma conta?{" "}
        <Link href="/register" className="font-medium text-emerald-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
