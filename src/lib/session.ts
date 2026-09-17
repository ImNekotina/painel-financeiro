import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

export { SESSION_COOKIE_NAME };
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

/**
 * O cookie guarda apenas um token opaco e aleatório.
 * No banco, armazenamos o HASH desse token (nunca o token em texto puro),
 * assim como fazemos com senhas — se o banco vazar, os tokens de sessão
 * não podem ser reutilizados diretamente.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, userAgent?: string | null) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      id: tokenHash,
      userId,
      expiresAt,
      userAgent: userAgent?.slice(0, 255) ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Retorna o usuário autenticado, SEMPRE derivado da sessão no servidor
 * (cookie httpOnly assinado pela existência no banco), nunca de dados
 * enviados pelo cliente (body, query string, headers arbitrários).
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { id: tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Sessão expirada: remove e retorna null.
    await prisma.session.delete({ where: { id: tokenHash } }).catch(() => {});
    return null;
  }

  // Removemos explicitamente o hash da senha antes de retornar o usuário —
  // nenhuma rota ou componente do servidor deve ter acesso a ele além do
  // necessário para verificação de login/troca de senha.
  const safeUser = { ...session.user } as Partial<typeof session.user>;
  delete safeUser.passwordHash;
  return safeUser as Omit<typeof session.user, "passwordHash">;
}

/** Lança se não houver usuário autenticado. Use em todas as actions protegidas. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.delete({ where: { id: tokenHash } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
