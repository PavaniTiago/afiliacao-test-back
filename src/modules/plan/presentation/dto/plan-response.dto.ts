import { Plan } from '../../domain/entities/plan.entity';

export class PlanResponseDto {
  id: string;
  nome: string;
  precoMensal: number;
  beneficios: string;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(plan: Plan): PlanResponseDto {
    return {
      id: plan.id,
      nome: plan.nome.value,
      precoMensal: plan.precoMensal.value,
      beneficios: plan.beneficios.value,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
