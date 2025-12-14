import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { databaseProviders } from './database.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DrizzleService, ...databaseProviders],
  exports: [DrizzleService, ...databaseProviders],
})
export class DatabaseModule {}
