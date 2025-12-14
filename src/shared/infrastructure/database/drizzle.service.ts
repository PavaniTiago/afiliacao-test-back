import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public db: PostgresJsDatabase;
  private client: postgres.Sql;

  constructor(private configService: ConfigService) {
    const dbUser = this.configService.get('DB_USER') || 'postgres';
    const dbPassword = this.configService.get('DB_PASSWORD') || 'postgres';
    const dbHost = this.configService.get('DB_HOST') || 'localhost';
    const dbPort = this.configService.get('DB_PORT') || '5432';
    const dbName = this.configService.get('DB_NAME') || 'afiliacao_db';

    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    console.log('🔌 Connecting to database...');
    console.log(`  - Host: ${dbHost}:${dbPort}`);
    console.log(`  - Database: ${dbName}`);
    console.log(`  - User: ${dbUser}`);

    try {
      this.client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        onnotice: () => {}, // Suppress notices
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
