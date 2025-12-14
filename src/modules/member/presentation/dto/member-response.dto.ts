import { Member } from '../../domain/entities/member.entity';

export class MemberResponseDto {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  planoId: string;
  afiliadoId: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(member: Member): MemberResponseDto {
    return {
      id: member.id,
      nome: member.nome.value,
      email: member.email.value,
      telefone: member.telefone.value,
      planoId: member.planoId,
      afiliadoId: member.afiliadoId,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
