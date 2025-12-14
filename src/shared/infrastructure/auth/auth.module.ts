import { Global, Module } from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthController } from './controllers/auth.controller';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [BetterAuthService, AuthGuard],
  exports: [BetterAuthService, AuthGuard],
})
export class AuthModule {}
