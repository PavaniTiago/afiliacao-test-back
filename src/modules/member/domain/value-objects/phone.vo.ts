import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidPhoneError } from '../errors/member.errors';

interface PhoneProps {
  value: string;
}

export class Phone extends ValueObject<PhoneProps> {
  private constructor(props: PhoneProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(phone: string): Result<Phone> {
    if (!phone || phone.trim().length === 0) {
      return fail(new InvalidPhoneError('Phone cannot be empty'));
    }

    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return fail(
        new InvalidPhoneError(
          'Phone must have 10 or 11 digits (Brazilian format)',
        ),
      );
    }

    return success(new Phone({ value: digitsOnly }));
  }
}
