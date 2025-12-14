import { Member } from '../../../domain/entities/member.entity';
import { Result } from '../../../../../shared/domain/result';
import { member } from '../schema/member.schema';

export type MemberRecord = typeof member.$inferSelect;
export type MemberPersistence = typeof member.$inferInsert;

export class MemberMapper {
  static toDomain(raw: MemberRecord): Result<Member> {
    return Member.create(
      {
        nome: raw.nome,
        email: raw.email,
        telefone: raw.telefone,
        planoId: raw.planoId,
        afiliadoId: raw.afiliadoId,
        userId: raw.userId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPersistence(memberEntity: Member): MemberPersistence {
    return {
      id: memberEntity.id,
      nome: memberEntity.nome.value,
      email: memberEntity.email.value,
      telefone: memberEntity.telefone.value,
      planoId: memberEntity.planoId,
      afiliadoId: memberEntity.afiliadoId,
      userId: memberEntity.userId,
      createdAt: memberEntity.createdAt,
      updatedAt: memberEntity.updatedAt,
    };
  }
}
