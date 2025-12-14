import { Either, left, right } from './either';

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export type Result<T> = Either<DomainError, T>;

export const fail = <T>(error: DomainError): Result<T> => left(error);
export const success = <T>(value: T): Result<T> => right(value);
