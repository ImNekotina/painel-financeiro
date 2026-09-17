"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema, registerSchema } from "@/schemas/auth";

export type ActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

async function getClientIp() {
  const h = await headers();
  // x-forwarded-for pode conter uma lista; usamos o primeiro IP.
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}

export async function registerAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000); // 5 por hora
  if (!limit.success) {
    return {
      success: false,
      message: "Muitas tentativas. Tente novamente mais tarde.",
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Mensagem genérica: não revela se o e-mail existe ou não seria ideal,
    // mas para cadastro é aceitável orientar o usuário; evitamos apenas
    // vazar detalhes internos.
    return {
      success: false,
      message: "Não foi possível concluir o cadastro com os dados informados.",
      fieldErrors: { email: ["Este e-mail já está em uso."] },
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  // Cria categorias padrão para o novo usuário.
  await prisma.category.createMany({
    data: [
      { userId: user.id, name: "Alimentação", color: "#f59e0b" },
      { userId: user.id, name: "Transporte", color: "#3b82f6" },
      { userId: user.id, name: "Moradia", color: "#8b5cf6" },
      { userId: user.id, name: "Lazer", color: "#ec4899" },
      { userId: user.id, name: "Saúde", color: "#10b981" },
      { userId: user.id, name: "Educação", color: "#06b6d4" },
      { userId: user.id, name: "Assinaturas", color: "#6366f1" },
      { userId: user.id, name: "Outros", color: "#64748b" },
    ],
  });

  const h = await headers();
  await createSession(user.id, h.get("user-agent"));

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000); // 10 por 15min
  if (!limit.success) {
    return {
      success: false,
      message: "Muitas tentativas de login. Tente novamente em alguns minutos.",
    };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Mensagem idêntica para e-mail inexistente e senha errada,
  // para não revelar quais e-mails estão cadastrados.
  const genericError: ActionResult = {
    success: false,
    message: "E-mail ou senha inválidos.",
  };

  if (!user) return genericError;

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) return genericError;

  const h = await headers();
  await createSession(user.id, h.get("user-agent"));

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
