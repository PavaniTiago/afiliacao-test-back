import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidMemberNameError } from '../errors/member.errors';

interface MemberNameProps {
  value: string;
}

export class MemberName extends ValueObject<MemberNameProps> {
  private constructor(props: MemberNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): Result<MemberName> {
    if (!name || name.trim().length === 0) {
      return fail(new InvalidMemberNameError('Name cannot be empty'));
    }

    if (name.trim().length < 3) {
      return fail(
        new InvalidMemberNameError('Name must be at least 3 characters long'),
      );
    }

    if (name.trim().length > 200) {
      return fail(
        new InvalidMemberNameError('Name cannot exceed 200 characters'),
      );
    }

    return success(new MemberName({ value: name.trim() }));
  }
}
