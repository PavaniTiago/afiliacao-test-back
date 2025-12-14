import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidAffiliateNameError } from '../errors/affiliate.errors';

interface AffiliateNameProps {
  value: string;
}

export class AffiliateName extends ValueObject<AffiliateNameProps> {
  private constructor(props: AffiliateNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): Result<AffiliateName> {
    if (!name || name.trim().length === 0) {
      return fail(new InvalidAffiliateNameError('Name cannot be empty'));
    }

    if (name.trim().length < 3) {
      return fail(
        new InvalidAffiliateNameError(
          'Name must be at least 3 characters long',
        ),
      );
    }

    if (name.trim().length > 200) {
      return fail(
        new InvalidAffiliateNameError('Name cannot exceed 200 characters'),
      );
    }

    return success(new AffiliateName({ value: name.trim() }));
  }
}
