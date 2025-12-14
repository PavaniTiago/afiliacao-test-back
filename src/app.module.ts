import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AuthModule } from './shared/infrastructure/auth/auth.module';
import { PlanModule } from './modules/plan/plan.module';
import { MemberModule } from './modules/member/member.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    PlanModule,
    MemberModule,
    AffiliateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
