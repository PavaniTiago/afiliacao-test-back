import { Affiliate } from '../entities/affiliate.entity';
import { Result } from '../../../../shared/domain/result';
import { PaginatedResult } from '../../../../shared/application/dto/pagination.dto';

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface AffiliateRanking {
  affiliate: Affiliate;
  indicationCount: number;
}

export interface IAffiliateRepository {
  findById(id: string, userId: string): Promise<Result<Affiliate | null>>;
  findAll(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Affiliate>>>;
  getRanking(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<AffiliateRanking>>>;
  save(affiliate: Affiliate): Promise<Result<Affiliate>>;
  update(affiliate: Affiliate, userId: string): Promise<Result<Affiliate>>;
  delete(id: string, userId: string): Promise<Result<void>>;
  existsByCode(code: string): Promise<Result<boolean>>;
}
