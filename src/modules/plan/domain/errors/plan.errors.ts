import { DomainError } from '../../../../shared/domain/result';

export class PlanNotFoundError extends DomainError {
  constructor(planId: string) {
    super(`Plan with id ${planId} not found`, 'PLAN_NOT_FOUND', 404);
  }
}

export class InvalidPlanNameError extends DomainError {
  constructor(reason: string) {
    super(`Invalid plan name: ${reason}`, 'INVALID_PLAN_NAME', 400);
  }
}

export class InvalidMonthlyPriceError extends DomainError {
  constructor(reason: string) {
    super(`Invalid monthly price: ${reason}`, 'INVALID_MONTHLY_PRICE', 400);
  }
}

export class InvalidBenefitsError extends DomainError {
  constructor(reason: string) {
    super(`Invalid benefits: ${reason}`, 'INVALID_BENEFITS', 400);
  }
}

export class PlanAlreadyExistsError extends DomainError {
  constructor(planName: string) {
    super(
      `Plan with name ${planName} already exists`,
      'PLAN_ALREADY_EXISTS',
      409,
    );
  }
}
