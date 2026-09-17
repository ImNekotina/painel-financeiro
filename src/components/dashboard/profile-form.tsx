"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/profile";
import type { ActionResult } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

const initialState: ActionResult | null = null;

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const err = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
          Perfil atualizado com sucesso.
        </div>
      )}
      {state && !state.success && !err && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {state.message}
        </div>
      )}

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={name} error={err?.name?.[0]} />
        <FieldError messages={err?.name} />
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required defaultValue={email} error={err?.email?.[0]} />
        <FieldError messages={err?.email} />
      </div>

      <Button type="submit" isLoading={isPending}>
        Salvar alterações
      </Button>
    </form>
  );
}
