import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public db: PostgresJsDatabase;
  private client: postgres.Sql;

  constructor(private configService: ConfigService) {
    const connectionString = `postgresql://${this.configService.get('DB_USER')}:${this.configService.get('DB_PASSWORD')}@${this.configService.get('DB_HOST')}:${this.configService.get('DB_PORT')}/${this.configService.get('DB_NAME')}`;

    this.client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    this.db = drizzle(this.client);
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
