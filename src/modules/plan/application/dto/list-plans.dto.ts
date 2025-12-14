import { z } from 'zod';
import { CursorPaginationSchema } from '../../../../shared/application/dto/pagination.dto';

export const ListPlansSchema = CursorPaginationSchema;

export type ListPlansDto = z.infer<typeof ListPlansSchema>;
