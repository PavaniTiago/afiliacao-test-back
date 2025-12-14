import { Injectable } from '@nestjs/common';
import { eq, gt, desc, and, sql } from 'drizzle-orm';
import { DrizzleService } from '../../../../../shared/infrastructure/database/drizzle.service';
import {
  IAffiliateRepository,
  CursorPaginationParams,
  AffiliateRanking,
} from '../../../domain/repositories/affiliate.repository.interface';
import { Affiliate } from '../../../domain/entities/affiliate.entity';
import {
  Result,
  success,
  fail,
  DomainError,
} from '../../../../../shared/domain/result';
import { affiliate } from '../schema/affiliate.schema';
import { member } from '../../../../member/infrastructure/persistence/schema/member.schema';
import {
  AffiliateMapper,
  AffiliatePersistence,
} from '../mappers/affiliate.mapper';
import { PaginatedResult } from '../../../../../shared/application/dto/pagination.dto';

@Injectable()
export class AffiliateRepository implements IAffiliateRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(
    id: string,
    userId: string,
  ): Promise<Result<Affiliate | null>> {
    try {
      const result = await this.drizzle.db
        .select()
        .from(affiliate)
        .where(and(eq(affiliate.id, id), eq(affiliate.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return success(null);
      }

      return AffiliateMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to find affiliate', 'DATABASE_ERROR', 500),
      );
    }
  }

  async findAll(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Affiliate>>> {
    try {
      const { cursor, limit } = params;

      const conditions = cursor
        ? and(eq(affiliate.userId, userId), gt(affiliate.id, cursor))
        : eq(affiliate.userId, userId);

      const results = await this.drizzle.db
        .select()
        .from(affiliate)
        .where(conditions)
        .orderBy(desc(affiliate.createdAt), desc(affiliate.id))
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, -1) : results;

      const domainAffiliates: Affiliate[] = [];
      for (const record of data) {
        const affiliateOrError = AffiliateMapper.toDomain(record);
        if (affiliateOrError.isLeft()) {
          return fail(affiliateOrError.value);
        }
        domainAffiliates.push(affiliateOrError.value);
      }

      return success({
        data: domainAffiliates,
        nextCursor:
          hasMore && data.length > 0 ? data[data.length - 1].id : null,
        hasMore,
      });
    } catch {
      return fail(
        new DomainError('Failed to list affiliates', 'DATABASE_ERROR', 500),
      );
    }
  }

  async getRanking(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<AffiliateRanking>>> {
    try {
      const { limit } = params;

      const query = this.drizzle.db
        .select({
          affiliate: affiliate,
          indicationCount: sql<number>`cast(count(${member.id}) as int)`,
        })
        .from(affiliate)
        .leftJoin(member, eq(member.afiliadoId, affiliate.id))
        .where(eq(affiliate.userId, userId))
        .groupBy(affiliate.id)
        .orderBy(
          desc(sql`count(${member.id})`),
          desc(affiliate.createdAt),
          desc(affiliate.id),
        )
        .limit(limit + 1);

      const results = await query;

      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, -1) : results;

      const rankings: AffiliateRanking[] = [];
      for (const record of data) {
        const affiliateOrError = AffiliateMapper.toDomain(record.affiliate);
        if (affiliateOrError.isLeft()) {
          return fail(affiliateOrError.value);
        }

        rankings.push({
          affiliate: affiliateOrError.value,
          indicationCount: record.indicationCount,
        });
      }

      return success({
        data: rankings,
        nextCursor:
          hasMore && data.length > 0
            ? data[data.length - 1].affiliate.id
            : null,
        hasMore,
      });
    } catch {
      return fail(
        new DomainError(
          'Failed to get affiliate ranking',
          'DATABASE_ERROR',
          500,
        ),
      );
    }
  }

  async save(affiliateEntity: Affiliate): Promise<Result<Affiliate>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const persistence: AffiliatePersistence =
        AffiliateMapper.toPersistence(affiliateEntity);
      const result = await this.drizzle.db
        .insert(affiliate)
        .values(persistence)
        .returning();
      return AffiliateMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to save affiliate', 'DATABASE_ERROR', 500),
      );
    }
  }

  async update(
    affiliateEntity: Affiliate,
    userId: string,
  ): Promise<Result<Affiliate>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const persistence: AffiliatePersistence =
        AffiliateMapper.toPersistence(affiliateEntity);
      const result = await this.drizzle.db
        .update(affiliate)
        .set(persistence)
        .where(
          and(
            eq(affiliate.id, affiliateEntity.id),
            eq(affiliate.userId, userId),
          ),
        )
        .returning();

      if (result.length === 0) {
        return fail(
          new DomainError('Affiliate not found', 'AFFILIATE_NOT_FOUND', 404),
        );
      }

      return AffiliateMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to update affiliate', 'DATABASE_ERROR', 500),
      );
    }
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    try {
      await this.drizzle.db
        .delete(affiliate)
        .where(and(eq(affiliate.id, id), eq(affiliate.userId, userId)));
      return success(undefined);
    } catch {
      return fail(
        new DomainError('Failed to delete affiliate', 'DATABASE_ERROR', 500),
      );
    }
  }

  async existsByCode(code: string): Promise<Result<boolean>> {
    try {
      const result = await this.drizzle.db
        .select({ id: affiliate.id })
        .from(affiliate)
        .where(eq(affiliate.codigo, code))
        .limit(1);

      return success(result.length > 0);
    } catch {
      return fail(
        new DomainError(
          'Failed to check affiliate existence',
          'DATABASE_ERROR',
          500,
        ),
      );
    }
  }
}
