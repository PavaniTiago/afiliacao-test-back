import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { MemberController } from './presentation/controllers/member.controller';
import { MemberService } from './application/member.service';
import { MemberRepository } from './infrastructure/persistence/repositories/member.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [MemberController],
  providers: [
    {
      provide: 'IMemberRepository',
      useClass: MemberRepository,
    },
    MemberService,
  ],
  exports: ['IMemberRepository', MemberService],
})
export class MemberModule {}
