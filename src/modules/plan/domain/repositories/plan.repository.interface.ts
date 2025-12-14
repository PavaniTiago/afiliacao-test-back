import { Plan } from '../entities/plan.entity';
import { Result } from '../../../../shared/domain/result';
import { PaginatedResult } from '../../../../shared/application/dto/pagination.dto';

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface IPlanRepository {
  findById(id: string): Promise<Result<Plan | null>>;
  findAll(
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Plan>>>;
  save(plan: Plan): Promise<Result<Plan>>;
  update(plan: Plan): Promise<Result<Plan>>;
  delete(id: string): Promise<Result<void>>;
  existsByName(name: string): Promise<Result<boolean>>;
}
