import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Suporte para DATABASE_URL (Railway) ou variáveis separadas (Docker/local)
const getDatabaseConfig = () => {
  // Se DATABASE_URL está disponível (Railway, Heroku, etc.)
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
    };
  }

  // Caso contrário, usa variáveis separadas
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'afiliacao_db',
  };
};

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: getDatabaseConfig(),
});
