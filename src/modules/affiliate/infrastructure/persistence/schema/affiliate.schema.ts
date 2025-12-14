import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { user } from '../../../../../shared/infrastructure/auth/schema/auth.schema';

export const affiliate = pgTable('affiliate', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  codigo: text('codigo').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
