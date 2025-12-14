import { z } from 'zod';

export const CreatePlanSchema = z.object({
  nome: z.string().min(3).max(100),
  precoMensal: z.number().positive().max(1000000),
  beneficios: z.string().min(10).max(500),
});

export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;
