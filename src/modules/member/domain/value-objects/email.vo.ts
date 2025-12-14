import { ValueObject } from '../../../../shared/domain/value-object';
import { Result, success, fail } from '../../../../shared/domain/result';
import { InvalidEmailError } from '../errors/member.errors';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Result<Email> {
    if (!email || email.trim().length === 0) {
      return fail(new InvalidEmailError('Email cannot be empty'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return fail(new InvalidEmailError('Email format is invalid'));
    }

    if (email.trim().length > 255) {
      return fail(new InvalidEmailError('Email cannot exceed 255 characters'));
    }

    return success(new Email({ value: email.trim().toLowerCase() }));
  }
}
