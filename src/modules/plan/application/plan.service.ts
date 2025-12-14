import { Injectable, Inject } from '@nestjs/common';
import type { IPlanRepository } from '../domain/repositories/plan.repository.interface';
import { Plan } from '../domain/entities/plan.entity';
import { Result, fail } from '../../../shared/domain/result';
import { PaginatedResult } from '../../../shared/application/dto/pagination.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ListPlansDto } from './dto/list-plans.dto';
import {
  PlanNotFoundError,
  PlanAlreadyExistsError,
} from '../domain/errors/plan.errors';
import { PlanName } from '../domain/value-objects/plan-name.vo';
import { MonthlyPrice } from '../domain/value-objects/monthly-price.vo';
import { Benefits } from '../domain/value-objects/benefits.vo';

@Injectable()
export class PlanService {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
  ) {}

  async create(dto: CreatePlanDto): Promise<Result<Plan>> {
    const existsResult = await this.planRepository.existsByName(dto.nome);
    if (existsResult.isLeft()) {
      return fail(existsResult.value);
    }

    if (existsResult.value) {
      return fail(new PlanAlreadyExistsError(dto.nome));
    }

    const planOrError = Plan.create({
      nome: dto.nome,
      precoMensal: dto.precoMensal,
      beneficios: dto.beneficios,
    });

    if (planOrError.isLeft()) {
      return fail(planOrError.value);
    }

    return await this.planRepository.save(planOrError.value);
  }

  async findById(id: string): Promise<Result<Plan | null>> {
    return await this.planRepository.findById(id);
  }

  async findAll(dto: ListPlansDto): Promise<Result<PaginatedResult<Plan>>> {
    return await this.planRepository.findAll({
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Result<Plan>> {
    const planResult = await this.planRepository.findById(id);
    if (planResult.isLeft()) {
      return fail(planResult.value);
    }

    if (!planResult.value) {
      return fail(new PlanNotFoundError(id));
    }

    const existingPlan = planResult.value;

    if (dto.nome) {
      const nameOrError = PlanName.create(dto.nome);
      if (nameOrError.isLeft()) {
        return fail(nameOrError.value);
      }

      const updateResult = existingPlan.updateName(nameOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.precoMensal) {
      const priceOrError = MonthlyPrice.create(dto.precoMensal);
      if (priceOrError.isLeft()) {
        return fail(priceOrError.value);
      }

      const updateResult = existingPlan.updatePrice(priceOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.beneficios) {
      const benefitsOrError = Benefits.create(dto.beneficios);
      if (benefitsOrError.isLeft()) {
        return fail(benefitsOrError.value);
      }

      const updateResult = existingPlan.updateBenefits(benefitsOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    return await this.planRepository.update(existingPlan);
  }

  async delete(id: string): Promise<Result<void>> {
    const planResult = await this.planRepository.findById(id);
    if (planResult.isLeft()) {
      return fail(planResult.value);
    }

    if (!planResult.value) {
      return fail(new PlanNotFoundError(id));
    }

    return await this.planRepository.delete(id);
  }
}
