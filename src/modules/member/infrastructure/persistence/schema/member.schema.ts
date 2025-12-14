import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { plan } from '../../../../plan/infrastructure/persistence/schema/plan.schema';
import { affiliate } from '../../../../affiliate/infrastructure/persistence/schema/affiliate.schema';
import { user } from '../../../../../shared/infrastructure/auth/schema/auth.schema';

export const member = pgTable('member', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').notNull(),
  planoId: uuid('plano_id')
    .notNull()
    .references(() => plan.id, { onDelete: 'restrict' }),
  afiliadoId: uuid('afiliado_id').references(() => affiliate.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
