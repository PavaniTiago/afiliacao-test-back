import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidMonthlyPriceError } from '../errors/plan.errors';

interface MonthlyPriceProps {
  value: number;
}

export class MonthlyPrice extends ValueObject<MonthlyPriceProps> {
  private constructor(props: MonthlyPriceProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(price: number): Result<MonthlyPrice> {
    if (price <= 0) {
      return fail(
        new InvalidMonthlyPriceError('Price must be greater than zero'),
      );
    }

    if (price > 1000000) {
      return fail(
        new InvalidMonthlyPriceError('Price exceeds maximum allowed value'),
      );
    }

    const roundedPrice = Math.round(price * 100) / 100;

    return success(new MonthlyPrice({ value: roundedPrice }));
  }
}
