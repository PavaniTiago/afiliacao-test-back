import { pgTable, text, numeric, uuid, timestamp } from 'drizzle-orm/pg-core';

export const plan = pgTable('plan', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: text('nome').notNull(),
  precoMensal: numeric('preco_mensal', { precision: 10, scale: 2 }).notNull(),
  beneficios: text('beneficios').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
