import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { AffiliateController } from './presentation/controllers/affiliate.controller';
import { AffiliateService } from './application/affiliate.service';
import { AffiliateRepository } from './infrastructure/persistence/repositories/affiliate.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AffiliateController],
  providers: [
    {
      provide: 'IAffiliateRepository',
      useClass: AffiliateRepository,
    },
    AffiliateService,
  ],
  exports: ['IAffiliateRepository', AffiliateService],
})
export class AffiliateModule {}
