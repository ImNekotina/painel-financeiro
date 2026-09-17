import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe um nome.").max(60, "Nome muito longo."),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.")
    .default("#6366f1"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
