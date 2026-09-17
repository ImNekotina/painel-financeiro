import "server-only";

/**
 * Rate limiting simples em memória (janela fixa).
 *
 * LIMITAÇÃO IMPORTANTE: isso funciona apenas em uma única instância do
 * processo Node. Em produção com múltiplas instâncias/serverless, substitua
 * por um armazenamento compartilhado (ex.: Redis / Upstash) — veja o README.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Evita crescimento infinito do mapa em processos de longa duração.
function cleanup() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

let lastCleanup = Date.now();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key identificador único (ex.: `login:IP` ou `register:IP`)
 * @param limit número máximo de tentativas na janela
 * @param windowMs duração da janela em milissegundos
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (now - lastCleanup > 60_000) {
    cleanup();
    lastCleanup = now;
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
