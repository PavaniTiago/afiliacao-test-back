import { Affiliate } from '../../domain/entities/affiliate.entity';
import { AffiliateRanking } from '../../domain/repositories/affiliate.repository.interface';

export class AffiliateResponseDto {
  id: string;
  nome: string;
  codigo: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(affiliate: Affiliate): AffiliateResponseDto {
    return {
      id: affiliate.id,
      nome: affiliate.nome.value,
      codigo: affiliate.codigo.value,
      userId: affiliate.userId,
      createdAt: affiliate.createdAt,
      updatedAt: affiliate.updatedAt,
    };
  }
}

export class AffiliateRankingResponseDto {
  affiliate: AffiliateResponseDto;
  indicationCount: number;

  static fromDomain(ranking: AffiliateRanking): AffiliateRankingResponseDto {
    return {
      affiliate: AffiliateResponseDto.fromDomain(ranking.affiliate),
      indicationCount: ranking.indicationCount,
    };
  }
}
