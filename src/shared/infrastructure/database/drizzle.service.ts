import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public db: PostgresJsDatabase;
  private client: postgres.Sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get('DATABASE_URL');

    let connectionString: string;

    if (databaseUrl) {
      connectionString = databaseUrl;
      console.log('🔌 Connecting to database using DATABASE_URL...');
    } else {
      const dbUser =
        this.configService.get('DB_USER') ||
        this.configService.get('PGUSER') ||
        'postgres';
      const dbPassword =
        this.configService.get('DB_PASSWORD') ||
        this.configService.get('PGPASSWORD') ||
        'postgres';
      const dbHost =
        this.configService.get('DB_HOST') ||
        this.configService.get('PGHOST') ||
        'localhost';
      const dbPort =
        this.configService.get('DB_PORT') ||
        this.configService.get('PGPORT') ||
        '5432';
      const dbName =
        this.configService.get('DB_NAME') ||
        this.configService.get('PGDATABASE') ||
        'afiliacao_db';

      connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

      console.log('🔌 Connecting to database...');
      console.log(`  - Host: ${dbHost}:${dbPort}`);
      console.log(`  - Database: ${dbName}`);
      console.log(`  - User: ${dbUser}`);
    }

    try {
      this.client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        onnotice: () => {},
      });

      this.db = drizzle(this.client);
      console.log('✅ Database connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
