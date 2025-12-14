import { Member } from '../entities/member.entity';
import { Result } from '../../../../shared/domain/result';
import { PaginatedResult } from '../../../../shared/application/dto/pagination.dto';

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface IMemberRepository {
  findById(id: string, userId: string): Promise<Result<Member | null>>;
  findAll(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Member>>>;
  findByAffiliate(
    affiliateId: string,
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Member>>>;
  save(member: Member): Promise<Result<Member>>;
  update(member: Member, userId: string): Promise<Result<Member>>;
  delete(id: string, userId: string): Promise<Result<void>>;
  existsByEmail(email: string): Promise<Result<boolean>>;
}
