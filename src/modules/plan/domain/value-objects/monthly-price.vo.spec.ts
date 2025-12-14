import { MonthlyPrice } from './monthly-price.vo';

describe('MonthlyPrice', () => {
  describe('create', () => {
    it('should create a valid price', () => {
      const result = MonthlyPrice.create(99.99);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe(99.99);
      }
    });

    it('should round price to 2 decimal places', () => {
      const result = MonthlyPrice.create(99.999);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe(100);
      }
    });

    it('should fail when price is zero', () => {
      const result = MonthlyPrice.create(0);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Price must be greater than zero',
        );
      }
    });

    it('should fail when price is negative', () => {
      const result = MonthlyPrice.create(-10);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Price must be greater than zero',
        );
      }
    });

    it('should fail when price exceeds maximum', () => {
      const result = MonthlyPrice.create(1000001);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain(
          'Price exceeds maximum allowed value',
        );
      }
    });

    it('should accept price at maximum limit', () => {
      const result = MonthlyPrice.create(1000000);

      expect(result.isRight()).toBe(true);
    });

    it('should accept small valid prices', () => {
      const result = MonthlyPrice.create(0.01);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.value).toBe(0.01);
      }
    });
  });
});
