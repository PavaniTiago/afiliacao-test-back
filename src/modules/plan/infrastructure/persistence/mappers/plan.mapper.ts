import { Plan } from '../../../domain/entities/plan.entity';
import { Result } from '../../../../../shared/domain/result';

export class PlanMapper {
  static toDomain(raw: any): Result<Plan> {
    return Plan.create(
      {
        nome: raw.nome,
        precoMensal: parseFloat(raw.precoMensal),
        beneficios: raw.beneficios,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPersistence(plan: Plan): any {
    return {
      id: plan.id,
      nome: plan.nome.value,
      precoMensal: plan.precoMensal.value.toString(),
      beneficios: plan.beneficios.value,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
