import { z } from 'zod';

export const UpdatePlanSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  precoMensal: z.number().positive().max(1000000).optional(),
  beneficios: z.string().min(10).max(500).optional(),
});

export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;
