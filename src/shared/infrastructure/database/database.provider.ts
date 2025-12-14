import { Provider } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (drizzleService: DrizzleService) => drizzleService.db,
    inject: [DrizzleService],
  },
];
