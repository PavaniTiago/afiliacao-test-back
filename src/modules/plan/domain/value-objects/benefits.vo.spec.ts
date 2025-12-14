import { Benefits } from './benefits.vo';

describe('Benefits', () => {
  describe('create', () => {
    it('should create valid benefits', () => {
      const result = Benefits.create('Access to all premium features');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('Access to all premium features');
      }
    });

    it('should trim whitespace from benefits', () => {
      const result = Benefits.create('  Access to all premium features  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('Access to all premium features');
      }
    });

    it('should fail when benefits is empty', () => {
      const result = Benefits.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Benefits cannot be empty');
      }
    });

    it('should fail when benefits is less than 10 characters', () => {
      const result = Benefits.create('Short');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Benefits must be at least 10 characters long',
        );
      }
    });

    it('should fail when benefits exceeds 500 characters', () => {
      const longBenefits = 'a'.repeat(501);
      const result = Benefits.create(longBenefits);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Benefits cannot exceed 500 characters',
        );
      }
    });

    it('should accept benefits with exactly 10 characters', () => {
      const result = Benefits.create('1234567890');

      expect(result.isRight()).toBe(true);
    });

    it('should accept benefits with exactly 500 characters', () => {
      const benefits = 'a'.repeat(500);
      const result = Benefits.create(benefits);

      expect(result.isRight()).toBe(true);
    });
  });
});
