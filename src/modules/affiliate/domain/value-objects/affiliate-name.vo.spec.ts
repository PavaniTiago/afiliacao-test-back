import { AffiliateName } from './affiliate-name.vo';

describe('AffiliateName', () => {
  describe('create', () => {
    it('should create a valid affiliate name', () => {
      const result = AffiliateName.create('John Doe');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('John Doe');
      }
    });

    it('should trim whitespace from name', () => {
      const result = AffiliateName.create('  John Doe  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('John Doe');
      }
    });

    it('should fail when name is empty', () => {
      const result = AffiliateName.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Name cannot be empty');
      }
    });

    it('should fail when name is only whitespace', () => {
      const result = AffiliateName.create('   ');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Name cannot be empty');
      }
    });

    it('should fail when name is less than 3 characters', () => {
      const result = AffiliateName.create('Ab');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name must be at least 3 characters long',
        );
      }
    });

    it('should fail when name exceeds 200 characters', () => {
      const longName = 'a'.repeat(201);
      const result = AffiliateName.create(longName);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name cannot exceed 200 characters',
        );
      }
    });

    it('should accept name with exactly 3 characters', () => {
      const result = AffiliateName.create('Abc');

      expect(result.isRight()).toBe(true);
    });

    it('should accept name with exactly 200 characters', () => {
      const name = 'a'.repeat(200);
      const result = AffiliateName.create(name);

      expect(result.isRight()).toBe(true);
    });
  });
});
