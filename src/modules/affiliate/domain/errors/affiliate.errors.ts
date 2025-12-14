import { DomainError } from '../../../../shared/domain/result';

export class AffiliateNotFoundError extends DomainError {
  constructor(affiliateId: string) {
    super(
      `Affiliate with id ${affiliateId} not found`,
      'AFFILIATE_NOT_FOUND',
      404,
    );
  }
}

export class InvalidAffiliateNameError extends DomainError {
  constructor(reason: string) {
    super(`Invalid affiliate name: ${reason}`, 'INVALID_AFFILIATE_NAME', 400);
  }
}

export class InvalidAffiliateCodeError extends DomainError {
  constructor(reason: string) {
    super(`Invalid affiliate code: ${reason}`, 'INVALID_AFFILIATE_CODE', 400);
  }
}

export class AffiliateCodeAlreadyExistsError extends DomainError {
  constructor(code: string) {
    super(
      `Affiliate with code ${code} already exists`,
      'AFFILIATE_CODE_ALREADY_EXISTS',
      409,
    );
  }
}
