import { Affiliate } from '../../../domain/entities/affiliate.entity';
import { Result } from '../../../../../shared/domain/result';
import { affiliate } from '../schema/affiliate.schema';

export type AffiliateRecord = typeof affiliate.$inferSelect;
export type AffiliatePersistence = typeof affiliate.$inferInsert;

export class AffiliateMapper {
  static toDomain(raw: AffiliateRecord): Result<Affiliate> {
    return Affiliate.create(
      {
        nome: raw.nome,
        codigo: raw.codigo,
        userId: raw.userId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPersistence(affiliateEntity: Affiliate): AffiliatePersistence {
    return {
      id: affiliateEntity.id,
      nome: affiliateEntity.nome.value,
      codigo: affiliateEntity.codigo.value,
      userId: affiliateEntity.userId,
      createdAt: affiliateEntity.createdAt,
      updatedAt: affiliateEntity.updatedAt,
    };
  }
}
