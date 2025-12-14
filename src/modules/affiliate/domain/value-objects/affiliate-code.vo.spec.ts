import { AffiliateCode } from './affiliate-code.vo';

describe('AffiliateCode', () => {
  describe('create', () => {
    it('should create a valid affiliate code', () => {
      const result = AffiliateCode.create('ABC123');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('ABC123');
      }
    });

    it('should convert code to uppercase', () => {
      const result = AffiliateCode.create('abc123');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('ABC123');
      }
    });

    it('should trim whitespace from code', () => {
      const result = AffiliateCode.create('  ABC123  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('ABC123');
      }
    });

    it('should fail when code is empty', () => {
      const result = AffiliateCode.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Code cannot be empty');
      }
    });

    it('should fail when code is less than 6 characters', () => {
      const result = AffiliateCode.create('ABC12');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Code must be at least 6 characters long',
        );
      }
    });

    it('should fail when code exceeds 20 characters', () => {
      const longCode = 'A'.repeat(21);
      const result = AffiliateCode.create(longCode);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Code cannot exceed 20 characters',
        );
      }
    });

    it('should fail when code contains non-alphanumeric characters', () => {
      const result = AffiliateCode.create('ABC-123');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Code must be alphanumeric');
      }
    });

    it('should fail when code contains spaces', () => {
      const result = AffiliateCode.create('ABC 123');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Code must be alphanumeric');
      }
    });

    it('should accept code with exactly 6 characters', () => {
      const result = AffiliateCode.create('ABC123');

      expect(result.isRight()).toBe(true);
    });

    it('should accept code with exactly 20 characters', () => {
      const code = 'A'.repeat(20);
      const result = AffiliateCode.create(code);

      expect(result.isRight()).toBe(true);
    });
  });
});
