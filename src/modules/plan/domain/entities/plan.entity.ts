import { Entity } from '../../../../shared/domain/entity';
import { Result, success, fail } from '../../../../shared/domain/result';
import { PlanName } from '../value-objects/plan-name.vo';
import { MonthlyPrice } from '../value-objects/monthly-price.vo';
import { Benefits } from '../value-objects/benefits.vo';

interface PlanProps {
  nome: PlanName;
  precoMensal: MonthlyPrice;
  beneficios: Benefits;
  createdAt: Date;
  updatedAt: Date;
}

export class Plan extends Entity<PlanProps> {
  private constructor(props: PlanProps, id?: string) {
    super(props, id);
  }

  get nome(): PlanName {
    return this.props.nome;
  }

  get precoMensal(): MonthlyPrice {
    return this.props.precoMensal;
  }

  get beneficios(): Benefits {
    return this.props.beneficios;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateName(newName: PlanName): Result<void> {
    this.props.nome = newName;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePrice(newPrice: MonthlyPrice): Result<void> {
    this.props.precoMensal = newPrice;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateBenefits(newBenefits: Benefits): Result<void> {
    this.props.beneficios = newBenefits;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: {
      nome: string;
      precoMensal: number;
      beneficios: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
    id?: string,
  ): Result<Plan> {
    const nameOrError = PlanName.create(props.nome);
    if (nameOrError.isLeft()) {
      return fail(nameOrError.value);
    }

    const priceOrError = MonthlyPrice.create(props.precoMensal);
    if (priceOrError.isLeft()) {
      return fail(priceOrError.value);
    }

    const benefitsOrError = Benefits.create(props.beneficios);
    if (benefitsOrError.isLeft()) {
      return fail(benefitsOrError.value);
    }

    const plan = new Plan(
      {
        nome: nameOrError.value,
        precoMensal: priceOrError.value,
        beneficios: benefitsOrError.value,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id,
    );

    return success(plan);
  }
}
