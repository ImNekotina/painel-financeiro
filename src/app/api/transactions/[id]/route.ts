import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Endpoint de exemplo que demonstra a proteção contra IDOR (item 10 do
 * briefing): o `id` na URL é apenas um identificador de recurso — a
 * autorização é decidida inteiramente pela sessão do servidor.
 *
 * Teste manual:
 *   1. Faça login como Usuário A, copie o ID de uma transação dele.
 *   2. Faça login como Usuário B (outra sessão/navegador).
 *   3. Acesse GET /api/transactions/<ID_DO_USUARIO_A> autenticado como B.
 *   4. Resultado esperado: 404 (nunca os dados do Usuário A).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  // A cláusula `userId: user.id` é o que impede acesso horizontal: mesmo
  // que o `id` pertença a outro usuário, a busca simplesmente não o encontra.
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  });

  if (!transaction) {
    // 404 genérico — nunca revela se o ID existe e pertence a outra pessoa.
    return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    id: transaction.id,
    type: transaction.type,
    amountCents: transaction.amountCents,
    description: transaction.description,
    date: transaction.date,
    category: transaction.category
      ? { id: transaction.category.id, name: transaction.category.name, color: transaction.category.color }
      : null,
  });
}
