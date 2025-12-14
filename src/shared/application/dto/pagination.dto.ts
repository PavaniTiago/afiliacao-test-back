import { z } from 'zod';

export const CursorPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CursorPaginationDto = z.infer<typeof CursorPaginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
