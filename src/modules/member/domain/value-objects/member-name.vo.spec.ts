import { MemberName } from './member-name.vo';

describe('MemberName', () => {
  describe('create', () => {
    it('should create a valid member name', () => {
      const result = MemberName.create('John Doe');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('John Doe');
      }
    });

    it('should trim whitespace from name', () => {
      const result = MemberName.create('  John Doe  ');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('John Doe');
      }
    });

    it('should fail when name is empty', () => {
      const result = MemberName.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Name cannot be empty');
      }
    });

    it('should fail when name is less than 3 characters', () => {
      const result = MemberName.create('Ab');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name must be at least 3 characters long',
        );
      }
    });

    it('should fail when name exceeds 200 characters', () => {
      const longName = 'a'.repeat(201);
      const result = MemberName.create(longName);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Name cannot exceed 200 characters',
        );
      }
    });
  });
});
