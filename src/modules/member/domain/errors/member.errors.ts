import { DomainError } from '../../../../shared/domain/result';

export class MemberNotFoundError extends DomainError {
  constructor(memberId: string) {
    super(`Member with id ${memberId} not found`, 'MEMBER_NOT_FOUND', 404);
  }
}

export class InvalidMemberNameError extends DomainError {
  constructor(reason: string) {
    super(`Invalid member name: ${reason}`, 'INVALID_MEMBER_NAME', 400);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(reason: string) {
    super(`Invalid email: ${reason}`, 'INVALID_EMAIL', 400);
  }
}

export class InvalidPhoneError extends DomainError {
  constructor(reason: string) {
    super(`Invalid phone: ${reason}`, 'INVALID_PHONE', 400);
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      `Member with email ${email} already exists`,
      'EMAIL_ALREADY_EXISTS',
      409,
    );
  }
}
