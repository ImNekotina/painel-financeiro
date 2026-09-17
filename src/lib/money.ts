/**
 * Todos os valores monetários são armazenados no banco como INTEIROS
 * (centavos) para evitar erros de ponto flutuante em somas/subtrações.
 * Ex.: R$ 10,50 é armazenado como 1050.
 */

export function reaisToCents(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Valor monetário inválido.");
  }
  return Math.round(value * 100);
}

export function centsToReais(cents: number): number {
  return cents / 100;
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centsToReais(cents));
}

export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
