import { Email } from './email.vo';

describe('Email', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const result = Email.create('john@example.com');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('john@example.com');
      }
    });

    it('should convert email to lowercase', () => {
      const result = Email.create('John@Example.COM');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('john@example.com');
      }
    });

    it('should trim whitespace from email', () => {
      const result = Email.create('  john@example.com  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('john@example.com');
      }
    });

    it('should fail when email is empty', () => {
      const result = Email.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Email cannot be empty');
      }
    });

    it('should fail when email format is invalid', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid.com',
      ];

      invalidEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isLeft()).toBe(true);
        if (result.isLeft()) {
          expect(result.value.message).toContain('Email format is invalid');
        }
      });
    });

    it('should fail when email exceeds 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = Email.create(longEmail);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Email cannot exceed 255 characters',
        );
      }
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.co.uk',
      ];

      validEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isRight()).toBe(true);
      });
    });
  });
});
