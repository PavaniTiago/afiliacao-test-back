import { Phone } from './phone.vo';

describe('Phone', () => {
  describe('create', () => {
    it('should create a valid phone with 10 digits', () => {
      const result = Phone.create('1199998888');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('1199998888');
      }
    });

    it('should create a valid phone with 11 digits', () => {
      const result = Phone.create('11999998888');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('11999998888');
      }
    });

    it('should strip non-digit characters', () => {
      const result = Phone.create('(11) 99999-8888');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe('11999998888');
      }
    });

    it('should accept phone with various formats', () => {
      const validPhones = ['11999998888', '(11) 99999-8888', '11 99999 8888'];

      validPhones.forEach((phone) => {
        const result = Phone.create(phone);
        expect(result.isRight()).toBe(true);
      });
    });

    it('should fail when phone is empty', () => {
      const result = Phone.create('');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('Phone cannot be empty');
      }
    });

    it('should fail when phone has less than 10 digits', () => {
      const result = Phone.create('119999888');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Phone must have 10 or 11 digits (Brazilian format)',
        );
      }
    });

    it('should fail when phone has more than 11 digits', () => {
      const result = Phone.create('119999988889');

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Phone must have 10 or 11 digits (Brazilian format)',
        );
      }
    });
  });
});
