"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { categorySchema } from "@/schemas/category";
import type { ActionResult } from "@/actions/auth";

export async function createCategoryAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await prisma.category.findFirst({
    where: { userId: user.id, name: parsed.data.name },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      message: "Categoria já existe.",
      fieldErrors: { name: ["Você já possui uma categoria com este nome."] },
    };
  }

  await prisma.category.create({
    data: { userId: user.id, ...parsed.data },
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const result = await prisma.category.updateMany({
    where: { id: categoryId, userId: user.id },
    data: parsed.data,
  });

  if (result.count === 0) {
    return { success: false, message: "Categoria não encontrada." };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const result = await prisma.category.deleteMany({
    where: { id: categoryId, userId: user.id },
  });

  if (result.count === 0) {
    return { success: false, message: "Categoria não encontrada." };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}
