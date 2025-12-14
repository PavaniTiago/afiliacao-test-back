import { z } from 'zod';

export const UpdateMemberSchema = z.object({
  nome: z.string().min(3).max(200).optional(),
  email: z.string().email().max(255).optional(),
  telefone: z.string().min(10).max(11).optional(),
  planoId: z.string().uuid().optional(),
  afiliadoId: z.preprocess(
    (val) => {
      if (val === '') return null;
      return val;
    },
    z.union([z.string().uuid(), z.null()]).optional(),
  ),
});

export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
