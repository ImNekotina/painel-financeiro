"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { reaisToCents } from "@/lib/money";
import { transactionSchema } from "@/schemas/transaction";
import type { ActionResult } from "@/actions/auth";

function parseFormAmount(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return NaN;
  // Aceita "1.234,56" (formato BR) ou "1234.56".
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function extractInput(formData: FormData) {
  const categoryIdRaw = formData.get("categoryId");
  return {
    type: formData.get("type"),
    amount: parseFormAmount(formData.get("amount")),
    description: formData.get("description"),
    categoryId: categoryIdRaw === "" ? null : categoryIdRaw,
    date: formData.get("date"),
  };
}

export async function createTransactionAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = transactionSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { type, amount, description, categoryId, date } = parsed.data;

  // Se uma categoria foi informada, confirmamos que ela pertence ao usuário
  // autenticado — nunca confiamos apenas no ID vindo do formulário.
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: user.id },
      select: { id: true },
    });
    if (!category) {
      return {
        success: false,
        message: "Categoria inválida.",
        fieldErrors: { categoryId: ["Categoria não encontrada."] },
      };
    }
  }

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type,
      amountCents: reaisToCents(amount),
      description,
      categoryId: categoryId ?? null,
      date,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function updateTransactionAction(
  transactionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = transactionSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { type, amount, description, categoryId, date } = parsed.data;

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: user.id },
      select: { id: true },
    });
    if (!category) {
      return {
        success: false,
        message: "Categoria inválida.",
        fieldErrors: { categoryId: ["Categoria não encontrada."] },
      };
    }
  }

  // A cláusula `userId: user.id` é o que impede um usuário de editar
  // transações de outra pessoa (proteção contra IDOR), mesmo que ele
  // manipule o ID na requisição.
  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, userId: user.id },
    data: {
      type,
      amountCents: reaisToCents(amount),
      description,
      categoryId: categoryId ?? null,
      date,
    },
  });

  if (result.count === 0) {
    return { success: false, message: "Transação não encontrada." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function deleteTransactionAction(transactionId: string): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  if (!transactionId || typeof transactionId !== "string") {
    return { success: false, message: "ID inválido." };
  }

  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId: user.id },
  });

  if (result.count === 0) {
    return { success: false, message: "Transação não encontrada." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}
