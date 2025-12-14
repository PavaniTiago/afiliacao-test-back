import { Entity } from '../../../../shared/domain/entity';
import { Result, success, fail } from '../../../../shared/domain/result';
import { MemberName } from '../value-objects/member-name.vo';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

interface MemberProps {
  nome: MemberName;
  email: Email;
  telefone: Phone;
  planoId: string;
  afiliadoId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Member extends Entity<MemberProps> {
  private constructor(props: MemberProps, id?: string) {
    super(props, id);
  }

  get nome(): MemberName {
    return this.props.nome;
  }

  get email(): Email {
    return this.props.email;
  }

  get telefone(): Phone {
    return this.props.telefone;
  }

  get planoId(): string {
    return this.props.planoId;
  }

  get afiliadoId(): string | null {
    return this.props.afiliadoId;
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

  public updateName(newName: MemberName): Result<void> {
    this.props.nome = newName;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateEmail(newEmail: Email): Result<void> {
    this.props.email = newEmail;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePhone(newPhone: Phone): Result<void> {
    this.props.telefone = newPhone;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updatePlan(newPlanId: string): Result<void> {
    this.props.planoId = newPlanId;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public updateAffiliate(newAfiliadoId: string | null): Result<void> {
    this.props.afiliadoId = newAfiliadoId;
    this.props.updatedAt = new Date();
    return success(undefined);
  }

  public static create(
    props: {
      nome: string;
      email: string;
      telefone: string;
      planoId: string;
      afiliadoId?: string | null;
      userId: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
    id?: string,
  ): Result<Member> {
    const nameOrError = MemberName.create(props.nome);
    if (nameOrError.isLeft()) {
      return fail(nameOrError.value);
    }

    const emailOrError = Email.create(props.email);
    if (emailOrError.isLeft()) {
      return fail(emailOrError.value);
    }

    const phoneOrError = Phone.create(props.telefone);
    if (phoneOrError.isLeft()) {
      return fail(phoneOrError.value);
    }

    const member = new Member(
      {
        nome: nameOrError.value,
        email: emailOrError.value,
        telefone: phoneOrError.value,
        planoId: props.planoId,
        afiliadoId: props.afiliadoId || null,
        userId: props.userId,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id,
    );

    return success(member);
  }
}
