import { PlanName } from './plan-name.vo';

describe('PlanName', () => {
  describe('create', () => {
    it('should create a valid plan name', () => {
      const result = PlanName.create('Premium Plan');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('Premium Plan');
      }
    });

    it('should trim whitespace from name', () => {
      const result = PlanName.create('  Premium Plan  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('Premium Plan');
      }
    });

    it('should fail when name is empty', () => {
      const result = PlanName.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Name cannot be empty');
      }
    });

    it('should fail when name is less than 3 characters', () => {
      const result = PlanName.create('Ab');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name must be at least 3 characters long',
        );
      }
    });

    it('should fail when name exceeds 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = PlanName.create(longName);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name cannot exceed 100 characters',
        );
      }
    });
  });
});
