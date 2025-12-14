import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidAffiliateCodeError } from '../errors/affiliate.errors';

interface AffiliateCodeProps {
  value: string;
}

export class AffiliateCode extends ValueObject<AffiliateCodeProps> {
  private constructor(props: AffiliateCodeProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(code: string): Result<AffiliateCode> {
    if (!code || code.trim().length === 0) {
      return fail(new InvalidAffiliateCodeError('Code cannot be empty'));
    }

    if (code.trim().length < 6) {
      return fail(
        new InvalidAffiliateCodeError(
          'Code must be at least 6 characters long',
        ),
      );
    }

    if (code.trim().length > 20) {
      return fail(
        new InvalidAffiliateCodeError('Code cannot exceed 20 characters'),
      );
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(code.trim())) {
      return fail(new InvalidAffiliateCodeError('Code must be alphanumeric'));
    }

    return success(new AffiliateCode({ value: code.trim().toUpperCase() }));
  }
}
