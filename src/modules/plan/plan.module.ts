import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { PlanController } from './presentation/controllers/plan.controller';
import { PlanService } from './application/plan.service';
import { PlanRepository } from './infrastructure/persistence/repositories/plan.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanController],
  providers: [
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
    PlanService,
  ],
  exports: ['IPlanRepository', PlanService],
})
export class PlanModule {}
