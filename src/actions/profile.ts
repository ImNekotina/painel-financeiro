"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, destroySession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema, updateProfileSchema } from "@/schemas/auth";
import type { ActionResult } from "@/actions/auth";

export async function updateProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email } = parsed.data;

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        message: "Não foi possível atualizar o perfil.",
        fieldErrors: { email: ["Este e-mail já está em uso."] },
      };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmNewPassword: formData.get("confirmNewPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fullUser) return { success: false, message: "Usuário não encontrado." };

  const validCurrent = await verifyPassword(
    parsed.data.currentPassword,
    fullUser.passwordHash
  );
  if (!validCurrent) {
    return {
      success: false,
      message: "Senha atual incorreta.",
      fieldErrors: { currentPassword: ["Senha atual incorreta."] },
    };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  // Invalida a sessão atual por segurança; o usuário precisa logar novamente.
  await destroySession();

  return { success: true };
}
