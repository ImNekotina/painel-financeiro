import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

/**
 * A partir do Next.js 16, este arquivo (antigo `middleware.ts`) roda por
 * padrão no runtime Node.js, não mais exclusivamente no Edge Runtime.
 *
 * Mesmo assim, mantemos aqui apenas uma checagem RÁPIDA e NÃO AUTORITATIVA:
 * existe um cookie de sessão? Isso evita que usuários deslogados cheguem a
 * carregar a UI do dashboard, e gera o nonce da CSP para cada requisição.
 *
 * A verificação REAL e autoritativa — se a sessão é válida, não expirou e
 * pertence a um usuário existente — acontece sempre no servidor, em
 * `getCurrentUser()`/`requireUser()` (que consultam o PostgreSQL via
 * Prisma), chamados no layout do dashboard e em toda server action. Ou
 * seja: mesmo que alguém falsifique um cookie com o nome certo, a camada
 * autoritativa (banco de dados) rejeita a sessão. Propositalmente não
 * consultamos o banco aqui, para manter o proxy leve e rápido em toda
 * requisição.
 */
const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = ["/login", "/register"];

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nonce por requisição para permitir o único <script> inline (definição
  // de tema) sob uma CSP estrita sem `unsafe-inline` em script-src.
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-nonce", nonce);

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
