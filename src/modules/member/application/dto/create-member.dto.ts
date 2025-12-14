import { z } from 'zod';

export const CreateMemberSchema = z.object({
  nome: z.string().min(3).max(200),
  email: z.string().email().max(255),
  telefone: z.string().min(10).max(11),
  planoId: z.string().uuid(),
  afiliadoId: z.string().uuid().optional(),
});

export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;
