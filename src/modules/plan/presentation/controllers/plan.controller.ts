import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../../shared/infrastructure/pipes/zod-validation.pipe';
import { AuthGuard } from '../../../../shared/infrastructure/auth/guards/auth.guard';
import { PlanService } from '../../application/plan.service';
import { CreatePlanSchema } from '../../application/dto/create-plan.dto';
import type { CreatePlanDto } from '../../application/dto/create-plan.dto';
import { UpdatePlanSchema } from '../../application/dto/update-plan.dto';
import type { UpdatePlanDto } from '../../application/dto/update-plan.dto';
import { ListPlansSchema } from '../../application/dto/list-plans.dto';
import type { ListPlansDto } from '../../application/dto/list-plans.dto';
import { PlanResponseDto } from '../dto/plan-response.dto';

@Controller('plans')
@UseGuards(AuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreatePlanSchema)) dto: CreatePlanDto,
  ) {
    const result = await this.planService.create(dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return PlanResponseDto.fromDomain(result.value);
  }

  @Get()
  async list(@Query(new ZodValidationPipe(ListPlansSchema)) dto: ListPlansDto) {
    const result = await this.planService.findAll(dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return {
      data: result.value.data.map((plan) => PlanResponseDto.fromDomain(plan)),
      nextCursor: result.value.nextCursor,
      hasMore: result.value.hasMore,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.planService.findById(id);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    if (!result.value) {
      throw new HttpException('Plan not found', 404);
    }

    return PlanResponseDto.fromDomain(result.value);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePlanSchema)) dto: UpdatePlanDto,
  ) {
    const result = await this.planService.update(id, dto);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return PlanResponseDto.fromDomain(result.value);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.planService.delete(id);

    if (result.isLeft()) {
      const error = result.value;
      throw new HttpException(
        { message: error.message, code: error.code },
        error.statusCode,
      );
    }

    return { message: 'Plan deleted successfully' };
  }
}
