import { z } from 'zod';

export const CreateAffiliateSchema = z.object({
  nome: z.string().min(3).max(200),
  codigo: z
    .string()
    .min(6)
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/),
});

export type CreateAffiliateDto = z.infer<typeof CreateAffiliateSchema> & {
  userId: string;
};
