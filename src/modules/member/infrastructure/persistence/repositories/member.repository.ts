import { Injectable } from '@nestjs/common';
import { eq, gt, desc, and } from 'drizzle-orm';
import { DrizzleService } from '../../../../../shared/infrastructure/database/drizzle.service';
import {
  IMemberRepository,
  CursorPaginationParams,
} from '../../../domain/repositories/member.repository.interface';
import { Member } from '../../../domain/entities/member.entity';
import {
  Result,
  success,
  fail,
  DomainError,
} from '../../../../../shared/domain/result';
import { member } from '../schema/member.schema';
import { MemberMapper, MemberPersistence } from '../mappers/member.mapper';
import { PaginatedResult } from '../../../../../shared/application/dto/pagination.dto';

@Injectable()
export class MemberRepository implements IMemberRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: string, userId: string): Promise<Result<Member | null>> {
    try {
      const result = await this.drizzle.db
        .select()
        .from(member)
        .where(and(eq(member.id, id), eq(member.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return success(null);
      }

      return MemberMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to find member', 'DATABASE_ERROR', 500),
      );
    }
  }

  async findAll(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Member>>> {
    try {
      const { cursor, limit } = params;

      const conditions = cursor
        ? and(eq(member.userId, userId), gt(member.id, cursor))
        : eq(member.userId, userId);

      const results = await this.drizzle.db
        .select()
        .from(member)
        .where(conditions)
        .orderBy(desc(member.createdAt), desc(member.id))
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, -1) : results;

      const domainMembers: Member[] = [];
      for (const record of data) {
        const memberOrError = MemberMapper.toDomain(record);
        if (memberOrError.isLeft()) {
          return fail(memberOrError.value);
        }
        domainMembers.push(memberOrError.value);
      }

      return success({
        data: domainMembers,
        nextCursor:
          hasMore && data.length > 0 ? data[data.length - 1].id : null,
        hasMore,
      });
    } catch {
      return fail(
        new DomainError('Failed to list members', 'DATABASE_ERROR', 500),
      );
    }
  }

  async findByAffiliate(
    affiliateId: string,
    userId: string,
    params: CursorPaginationParams,
  ): Promise<Result<PaginatedResult<Member>>> {
    try {
      const { cursor, limit } = params;

      const conditions = cursor
        ? and(
            eq(member.userId, userId),
            eq(member.afiliadoId, affiliateId),
            gt(member.id, cursor),
          )
        : and(eq(member.userId, userId), eq(member.afiliadoId, affiliateId));

      const results = await this.drizzle.db
        .select()
        .from(member)
        .where(conditions)
        .orderBy(desc(member.createdAt), desc(member.id))
        .limit(limit + 1);

      const hasMore = results.length > limit;
      const data = hasMore ? results.slice(0, -1) : results;

      const domainMembers: Member[] = [];
      for (const record of data) {
        const memberOrError = MemberMapper.toDomain(record);
        if (memberOrError.isLeft()) {
          return fail(memberOrError.value);
        }
        domainMembers.push(memberOrError.value);
      }

      return success({
        data: domainMembers,
        nextCursor:
          hasMore && data.length > 0 ? data[data.length - 1].id : null,
        hasMore,
      });
    } catch {
      return fail(
        new DomainError(
          'Failed to list members by affiliate',
          'DATABASE_ERROR',
          500,
        ),
      );
    }
  }

  async save(memberEntity: Member): Promise<Result<Member>> {
    try {
      const persistence: MemberPersistence =
        MemberMapper.toPersistence(memberEntity);
      const result = await this.drizzle.db
        .insert(member)
        .values(persistence)
        .returning();
      return MemberMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to save member', 'DATABASE_ERROR', 500),
      );
    }
  }

  async update(memberEntity: Member, userId: string): Promise<Result<Member>> {
    try {
      const persistence: MemberPersistence =
        MemberMapper.toPersistence(memberEntity);
      const result = await this.drizzle.db
        .update(member)
        .set(persistence)
        .where(and(eq(member.id, memberEntity.id), eq(member.userId, userId)))
        .returning();

      if (result.length === 0) {
        return fail(
          new DomainError('Member not found', 'MEMBER_NOT_FOUND', 404),
        );
      }

      return MemberMapper.toDomain(result[0]);
    } catch {
      return fail(
        new DomainError('Failed to update member', 'DATABASE_ERROR', 500),
      );
    }
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    try {
      await this.drizzle.db
        .delete(member)
        .where(and(eq(member.id, id), eq(member.userId, userId)));
      return success(undefined);
    } catch {
      return fail(
        new DomainError('Failed to delete member', 'DATABASE_ERROR', 500),
      );
    }
  }

  async existsByEmail(email: string): Promise<Result<boolean>> {
    try {
      const result = await this.drizzle.db
        .select({ id: member.id })
        .from(member)
        .where(eq(member.email, email))
        .limit(1);

      return success(result.length > 0);
    } catch {
      return fail(
        new DomainError(
          'Failed to check member existence',
          'DATABASE_ERROR',
          500,
        ),
      );
    }
  }
}
