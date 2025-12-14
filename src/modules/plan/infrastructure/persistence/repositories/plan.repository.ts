import { Injectable } from '@nestjs/common';
import { eq, gt, desc, and } from 'drizzle-orm';
import { DrizzleService } from '../../../../../shared/infrastructure/database/drizzle.service';
import {
  IPlanRepository,
  CursorPaginationParams,
} from '../../../domain/repositories/plan.repository.interface';
import { Plan } from '../../../domain/entities/plan.entity';
import { Result, success, fail } from '../../../../../shared/domain/result';
import { plan } from '../schema/plan.schema';
import { PlanMapper } from '../mappers/plan.mapper';
import { DomainError } from '../../../../../shared/domain/result';
import { PaginatedResult } from '../../../../../shared/application/dto/pagination.dto';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: string): Promise<Result<Plan | null>> {
    try {
      const result = await this.drizzle.db
        .select()
        .from(plan)
        .where(eq(plan.id, id))
        .limit(1);

      if (result.length === 0) {
        return success(null);
      }

      return PlanMapper.toDomain(result[0]);
    } catch (error) {
      return fail(
        new DomainError('Failed to find plan', 'DATABASE_ERROR', 500),
      );
    }
  }

  async findAll(
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Plan>>> {
    try {
      const { cursor, limit } = params;

      const conditions = cursor ? gt(plan.id, cursor) : undefined;

      const results = await this.drizzle.db
        .select()
        .from(plan)
        .where(conditions)
        .orderBy(desc(plan.createdAt), desc(plan.id))
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, -1) : results;

      const domainPlans: Plan[] = [];
      for (const record of data) {
        const planOrError = PlanMapper.toDomain(record);
        if (planOrError.isLeft()) {
          return fail(planOrError.value);
        }
        domainPlans.push(planOrError.value);
      }

      return success({
        data: domainPlans,
        nextCursor:
          hasMore && data.length > 0 ? data[data.length - 1].id : null,
        hasMore,
      });
    } catch (error) {
      return fail(
        new DomainError('Failed to list plans', 'DATABASE_ERROR', 500),
      );
    }
  }

  async save(planEntity: Plan): Promise<Result<Plan>> {
    try {
      const persistence = PlanMapper.toPersistence(planEntity);
      const result = await this.drizzle.db
        .insert(plan)
        .values(persistence)
        .returning();
      return PlanMapper.toDomain(result[0]);
    } catch (error) {
      return fail(
        new DomainError('Failed to save plan', 'DATABASE_ERROR', 500),
      );
    }
  }

  async update(planEntity: Plan): Promise<Result<Plan>> {
    try {
      const persistence = PlanMapper.toPersistence(planEntity);
      const result = await this.drizzle.db
        .update(plan)
        .set(persistence)
        .where(eq(plan.id, planEntity.id))
        .returning();

      if (result.length === 0) {
        return fail(new DomainError('Plan not found', 'PLAN_NOT_FOUND', 404));
      }

      return PlanMapper.toDomain(result[0]);
    } catch (error) {
      return fail(
        new DomainError('Failed to update plan', 'DATABASE_ERROR', 500),
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.drizzle.db.delete(plan).where(eq(plan.id, id));
      return success(undefined);
    } catch (error) {
      return fail(
        new DomainError('Failed to delete plan', 'DATABASE_ERROR', 500),
      );
    }
  }

  async existsByName(name: string): Promise<Result<boolean>> {
    try {
      const result = await this.drizzle.db
        .select({ id: plan.id })
        .from(plan)
        .where(eq(plan.nome, name))
        .limit(1);

      return success(result.length > 0);
    } catch (error) {
      return fail(
        new DomainError(
          'Failed to check plan existence',
          'DATABASE_ERROR',
          500,
        ),
      );
    }
  }
}
