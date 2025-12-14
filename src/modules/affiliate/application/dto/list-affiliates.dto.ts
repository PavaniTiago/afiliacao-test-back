import { z } from 'zod';
import { CursorPaginationSchema } from '../../../../shared/application/dto/pagination.dto';

export const ListAffiliatesSchema = CursorPaginationSchema;

export type ListAffiliatesDto = z.infer<typeof ListAffiliatesSchema>;
