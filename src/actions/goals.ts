"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { reaisToCents } from "@/lib/money";
import { goalSchema } from "@/schemas/goal";
import type { ActionResult } from "@/actions/auth";

function parseFormAmount(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value === "") return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function extractInput(formData: FormData) {
  const deadlineRaw = formData.get("deadline");
  return {
    title: formData.get("title"),
    targetAmount: parseFormAmount(formData.get("targetAmount")),
    currentAmount: parseFormAmount(formData.get("currentAmount")),
    deadline: deadlineRaw === "" ? null : deadlineRaw,
  };
}

export async function createGoalAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = goalSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, targetAmount, currentAmount, deadline } = parsed.data;

  await prisma.goal.create({
    data: {
      userId: user.id,
      title,
      targetAmountCents: reaisToCents(targetAmount),
      currentAmountCents: reaisToCents(currentAmount),
      deadline: deadline ?? null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
  return { success: true };
}

export async function updateGoalAction(
  goalId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const parsed = goalSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { title, targetAmount, currentAmount, deadline } = parsed.data;

  const result = await prisma.goal.updateMany({
    where: { id: goalId, userId: user.id },
    data: {
      title,
      targetAmountCents: reaisToCents(targetAmount),
      currentAmountCents: reaisToCents(currentAmount),
      deadline: deadline ?? null,
    },
  });

  if (result.count === 0) {
    return { success: false, message: "Meta não encontrada." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
  return { success: true };
}

export async function deleteGoalAction(goalId: string): Promise<ActionResult> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, message: "Sessão expirada. Faça login novamente." };

  const result = await prisma.goal.deleteMany({
    where: { id: goalId, userId: user.id },
  });

  if (result.count === 0) {
    return { success: false, message: "Meta não encontrada." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/goals");
  return { success: true };
}
