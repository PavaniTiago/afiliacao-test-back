import { z } from 'zod';

export const UpdateAffiliateSchema = z.object({
  nome: z.string().min(3).max(200).optional(),
  codigo: z
    .string()
    .min(6)
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/)
    .optional(),
});

export type UpdateAffiliateDto = z.infer<typeof UpdateAffiliateSchema>;
