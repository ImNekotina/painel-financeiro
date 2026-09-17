"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/actions/profile";
import type { ActionResult } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";

const initialState: ActionResult | null = null;

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);
  const err = state && !state.success ? state.fieldErrors : undefined;
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.push("/login"), 1800);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && !state.success && !err && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {state.message}
        </div>
      )}
      {state && state.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
          Senha alterada com sucesso. Você precisará entrar novamente na próxima vez.
        </div>
      )}

      <div>
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" error={err?.currentPassword?.[0]} />
        <FieldError messages={err?.currentPassword} />
      </div>

      <div>
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" error={err?.newPassword?.[0]} />
        <FieldError messages={err?.newPassword} />
      </div>

      <div>
        <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
        <Input id="confirmNewPassword" name="confirmNewPassword" type="password" required autoComplete="new-password" error={err?.confirmNewPassword?.[0]} />
        <FieldError messages={err?.confirmNewPassword} />
      </div>

      <Button type="submit" isLoading={isPending} variant="secondary">
        Alterar senha
      </Button>
    </form>
  );
}
