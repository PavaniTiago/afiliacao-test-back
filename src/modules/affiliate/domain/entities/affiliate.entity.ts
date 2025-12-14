import { Entity } from '../../../../shared/domain/entity';
import { Result, success, fail } from '../../../../shared/domain/result';
import { AffiliateName } from '../value-objects/affiliate-name.vo';
import { AffiliateCode } from '../value-objects/affiliate-code.vo';

interface AffiliateProps {
  nome: AffiliateName;
  codigo: AffiliateCode;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Affiliate extends Entity<AffiliateProps> {
  private constructor(props: AffiliateProps, id?: string) {
    super(props, id);
  }

  get nome(): AffiliateName {
    return this.props.nome;
  }

  get codigo(): AffiliateCode {
    return this.props.codigo;
  }

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateName(newName: AffiliateName): Result<void> {
    this.props.nome = newName;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateCode(newCode: AffiliateCode): Result<void> {
    this.props.codigo = newCode;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: {
      nome: string;
      codigo: string;
      userId: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
    id?: string,
  ): Result<Affiliate> {
    const nameOrError = AffiliateName.create(props.nome);
    if (nameOrError.isLeft()) {
      return fail(nameOrError.value);
    }

    const codeOrError = AffiliateCode.create(props.codigo);
    if (codeOrError.isLeft()) {
      return fail(codeOrError.value);
    }

    const affiliate = new Affiliate(
      {
        nome: nameOrError.value,
        codigo: codeOrError.value,
        userId: props.userId,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id,
    );

    return success(affiliate);
  }
}
