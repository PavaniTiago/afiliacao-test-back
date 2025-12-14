import { z } from 'zod';
import { CursorPaginationSchema } from '../../../../shared/application/dto/pagination.dto';

export const ListMembersSchema = CursorPaginationSchema;

export type ListMembersDto = z.infer<typeof ListMembersSchema>;
