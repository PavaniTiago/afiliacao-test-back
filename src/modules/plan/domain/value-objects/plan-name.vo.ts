import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidPlanNameError } from '../errors/plan.errors';

interface PlanNameProps {
  value: string;
}

export class PlanName extends ValueObject<PlanNameProps> {
  private constructor(props: PlanNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): Result<PlanName> {
    if (!name || name.trim().length === 0) {
      return fail(new InvalidPlanNameError('Name cannot be empty'));
    }

    if (name.trim().length < 3) {
      return fail(
        new InvalidPlanNameError('Name must be at least 3 characters long'),
      );
    }

    if (name.trim().length > 100) {
      return fail(
        new InvalidPlanNameError('Name cannot exceed 100 characters'),
      );
    }

    return success(new PlanName({ value: name.trim() }));
  }
}
