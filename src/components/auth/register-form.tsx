"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { registerAction, type ActionResult } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Button } from "@/components/ui/button";

const initialState: ActionResult | null = null;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const err = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.success && !err && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required autoComplete="name" placeholder="Seu nome completo" error={err?.name?.[0]} />
        <FieldError messages={err?.name} />
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@email.com" error={err?.email?.[0]} />
        <FieldError messages={err?.email} />
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres, maiúscula, minúscula e número"
            className="pr-10"
            error={err?.password?.[0]}
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
        <FieldError messages={err?.password} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          placeholder="Repita a senha"
          error={err?.confirmPassword?.[0]}
        />
        <FieldError messages={err?.confirmPassword} />
      </div>

      <Button type="submit" isLoading={isPending} className="w-full">
        Criar conta
      </Button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
