import { Injectable, Inject } from '@nestjs/common';
import type {
  IAffiliateRepository,
  AffiliateRanking,
} from '../domain/repositories/affiliate.repository.interface';
import { Affiliate } from '../domain/entities/affiliate.entity';
import { Result, fail } from '../../../shared/domain/result';
import { PaginatedResult } from '../../../shared/application/dto/pagination.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { ListAffiliatesDto } from './dto/list-affiliates.dto';
import {
  AffiliateNotFoundError,
  AffiliateCodeAlreadyExistsError,
} from '../domain/errors/affiliate.errors';
import { AffiliateName } from '../domain/value-objects/affiliate-name.vo';
import { AffiliateCode } from '../domain/value-objects/affiliate-code.vo';

@Injectable()
export class AffiliateService {
  constructor(
    @Inject('IAffiliateRepository')
    private readonly affiliateRepository: IAffiliateRepository,
  ) {}

  async create(dto: CreateAffiliateDto): Promise<Result<Affiliate>> {
    const existsResult = await this.affiliateRepository.existsByCode(
      dto.codigo,
    );
    if (existsResult.isLeft()) {
      return fail(existsResult.value);
    }

    if (existsResult.value) {
      return fail(new AffiliateCodeAlreadyExistsError(dto.codigo));
    }

    const affiliateOrError = Affiliate.create({
      nome: dto.nome,
      codigo: dto.codigo,
      userId: dto.userId,
    });

    if (affiliateOrError.isLeft()) {
      return fail(affiliateOrError.value);
    }

    return await this.affiliateRepository.save(affiliateOrError.value);
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<Result<Affiliate | null>> {
    return await this.affiliateRepository.findById(id, userId);
  }

  async findAll(
    userId: string,
    dto: ListAffiliatesDto,
  ): Promise<Result<PaginatedResult<Affiliate>>> {
    return await this.affiliateRepository.findAll(userId, {
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }

  async getRanking(
    userId: string,
    dto: ListAffiliatesDto,
  ): Promise<Result<PaginatedResult<AffiliateRanking>>> {
    return await this.affiliateRepository.getRanking(userId, {
      cursor: dto.cursor,
      limit: dto.limit,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAffiliateDto,
  ): Promise<Result<Affiliate>> {
    const affiliateResult = await this.affiliateRepository.findById(id, userId);
    if (affiliateResult.isLeft()) {
      return fail(affiliateResult.value);
    }

    if (!affiliateResult.value) {
      return fail(new AffiliateNotFoundError(id));
    }

    const existingAffiliate = affiliateResult.value;

    if (dto.nome) {
      const nameOrError = AffiliateName.create(dto.nome);
      if (nameOrError.isLeft()) {
        return fail(nameOrError.value);
      }

      const updateResult = existingAffiliate.updateName(nameOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    if (dto.codigo) {
      const codeOrError = AffiliateCode.create(dto.codigo);
      if (codeOrError.isLeft()) {
        return fail(codeOrError.value);
      }

      const updateResult = existingAffiliate.updateCode(codeOrError.value);
      if (updateResult.isLeft()) {
        return fail(updateResult.value);
      }
    }

    return await this.affiliateRepository.update(existingAffiliate, userId);
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    const affiliateResult = await this.affiliateRepository.findById(id, userId);
    if (affiliateResult.isLeft()) {
      return fail(affiliateResult.value);
    }

    if (!affiliateResult.value) {
      return fail(new AffiliateNotFoundError(id));
    }

    return await this.affiliateRepository.delete(id, userId);
  }
}
