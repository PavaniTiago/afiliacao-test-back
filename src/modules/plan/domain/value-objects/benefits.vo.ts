import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidBenefitsError } from '../errors/plan.errors';

interface BenefitsProps {
  value: string;
}

export class Benefits extends ValueObject<BenefitsProps> {
  private constructor(props: BenefitsProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(benefits: string): Result<Benefits> {
    if (!benefits || benefits.trim().length === 0) {
      return fail(new InvalidBenefitsError('Benefits cannot be empty'));
    }

    if (benefits.trim().length < 10) {
      return fail(
        new InvalidBenefitsError(
          'Benefits must be at least 10 characters long',
        ),
      );
    }

    if (benefits.trim().length > 500) {
      return fail(
        new InvalidBenefitsError('Benefits cannot exceed 500 characters'),
      );
    }

    return success(new Benefits({ value: benefits.trim() }));
  }
}
