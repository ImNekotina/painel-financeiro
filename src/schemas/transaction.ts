import { z } from "zod";

const MAX_AMOUNT_REAIS = 1_000_000_000; // limite de sanidade (1 bilhão)

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Tipo inválido." }),
  }),
  amount: z
    .number({ invalid_type_error: "Informe um valor numérico." })
    .finite("Valor inválido.")
    .positive("O valor deve ser maior que zero.")
    .max(MAX_AMOUNT_REAIS, "Valor muito alto."),
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição.")
    .max(200, "Descrição muito longa."),
  categoryId: z
    .string()
    .cuid("Categoria inválida.")
    .nullable()
    .optional(),
  date: z.coerce.date({ invalid_type_error: "Data inválida." }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const transactionFiltersSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "ALL"]).default("ALL"),
  categoryId: z.string().cuid().optional().or(z.literal("ALL")).default("ALL"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
