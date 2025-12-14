import { Injectable, Inject } from '@nestjs/common';
import type { IMemberRepository } from '../domain/repositories/member.repository.interface';
import { Member } from '../domain/entities/member.entity';
import { Result, fail } from '../../../shared/domain/result';
import { PaginatedResult } from '../../../shared/application/dto/pagination.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ListMembersDto } from './dto/list-members.dto';
import {
  MemberNotFoundError,
  EmailAlreadyExistsError,
} from '../domain/errors/member.errors';
import { MemberName } from '../domain/value-objects/member-name.vo';
import { Email } from '../domain/value-objects/email.vo';
import { Phone } from '../domain/value-objects/phone.vo';

@Injectable()
export class MemberService {
  constructor(
    @Inject('IMemberRepository')
    private readonly memberRepository: IMemberRepository,
  ) {}

  async create(
    dto: CreateMemberDto & { userId: string },
  ): Promise<Result<Member>> {
    const existsResult = await this.memberRepository.existsByEmail(dto.email);
    if (existsResult.isLeft()) {
      return fail(existsResult.value);
    }

    if (existsResult.value) {
      return fail(new EmailAlreadyExistsError(dto.email));
    }

    const memberOrError = Member.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      planoId: dto.planoId,
      afiliadoId: dto.afiliadoId,
      userId: dto.userId,
    });

    if (memberOrError.isLeft()) {
      return fail(memberOrError.value);
    }

    return await this.memberRepository.save(memberOrError.value);
  }

  async findById(id: string, userId: string): Promise<Result<Member | null>> {
    return await this.memberRepository.findById(id, userId);
  }

  async findAll(
    userId: string,
    dto: ListMembersDto,
  ): Promise<Result<PaginatedResult<Member>>> {
    return await this.memberRepository.findAll(userId, {
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }

  async listByAffiliate(
    affiliateId: string,
    userId: string,
    dto: ListMembersDto,
  ): Promise<Result<PaginatedResult<Member>>> {
    return await this.memberRepository.findByAffiliate(affiliateId, userId, {
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateMemberDto,
  ): Promise<Result<Member>> {
    const memberResult = await this.memberRepository.findById(id, userId);
    if (memberResult.isLeft()) {
      return fail(memberResult.value);
    }

    if (!memberResult.value) {
      return fail(new MemberNotFoundError(id));
    }

    const existingMember = memberResult.value;

    if (dto.nome) {
      const nameOrError = MemberName.create(dto.nome);
      if (nameOrError.isLeft()) {
        return fail(nameOrError.value);
      }

      const updateResult = existingMember.updateName(nameOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.email) {
      const emailOrError = Email.create(dto.email);
      if (emailOrError.isLeft()) {
        return fail(emailOrError.value);
      }

      const updateResult = existingMember.updateEmail(emailOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.telefone) {
      const phoneOrError = Phone.create(dto.telefone);
      if (phoneOrError.isLeft()) {
        return fail(phoneOrError.value);
      }

      const updateResult = existingMember.updatePhone(phoneOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.planoId) {
      const updateResult = existingMember.updatePlan(dto.planoId);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.afiliadoId !== undefined) {
      const updateResult = existingMember.updateAffiliate(dto.afiliadoId);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    return await this.memberRepository.update(existingMember, userId);
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    const memberResult = await this.memberRepository.findById(id, userId);
    if (memberResult.isLeft()) {
      return fail(memberResult.value);
    }

    if (!memberResult.value) {
      return fail(new MemberNotFoundError(id));
    }

    return await this.memberRepository.delete(id, userId);
  }
}
