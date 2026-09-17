import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Recuperar senha — Painel Financeiro" };

// FUNCIONALIDADE AINDA NÃO IMPLEMENTADA:
// O fluxo completo de recuperação de senha (envio de e-mail com token,
// expiração do token, redefinição segura) requer um provedor de e-mail
// transacional e foi deixado fora do escopo desta primeira versão.
// Veja o README para o que falta para produção.
export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Recuperação de senha" subtitle="Esta funcionalidade ainda não está disponível.">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        O envio de e-mail para redefinição de senha ainda não foi implementado
        nesta versão de demonstração. Por enquanto, você pode alterar sua
        senha diretamente na página de perfil após entrar na sua conta.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-emerald-600 hover:underline"
      >
        Voltar para o login
      </Link>
    </AuthShell>
  );
}
