import { z } from "zod";

const MAX_AMOUNT_REAIS = 1_000_000_000;

export const goalSchema = z.object({
  title: z.string().trim().min(1, "Informe um título.").max(120, "Título muito longo."),
  targetAmount: z
    .number({ invalid_type_error: "Informe um valor numérico." })
    .finite()
    .positive("O valor objetivo deve ser maior que zero.")
    .max(MAX_AMOUNT_REAIS, "Valor muito alto."),
  currentAmount: z
    .number({ invalid_type_error: "Informe um valor numérico." })
    .finite()
    .min(0, "O valor atual não pode ser negativo.")
    .max(MAX_AMOUNT_REAIS, "Valor muito alto.")
    .default(0),
  deadline: z.coerce.date().optional().nullable(),
});

export type GoalInput = z.infer<typeof goalSchema>;
