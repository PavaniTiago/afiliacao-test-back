import { Affiliate } from './affiliate.entity';
import { AffiliateName } from '../value-objects/affiliate-name.vo';
import { AffiliateCode } from '../value-objects/affiliate-code.vo';

describe('Affiliate', () => {
  const validAffiliateData = {
    nome: 'John Doe',
    codigo: 'ABC123',
    userId: 'user-123',
  };

  describe('create', () => {
    it('should create a valid affiliate', () => {
      const result = Affiliate.create(validAffiliateData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.nome.value).toBe('John Doe');
        expect(result.value.codigo.value).toBe('ABC123');
        expect(result.value.userId).toBe('user-123');
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should create affiliate with provided id', () => {
      const result = Affiliate.create(validAffiliateData, 'custom-id');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe('custom-id');
      }
    });

    it('should generate id when not provided', () => {
      const result = Affiliate.create(validAffiliateData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBeDefined();
        expect(typeof result.value.id).toBe('string');
      }
    });

    it('should use provided dates', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const result = Affiliate.create({
        ...validAffiliateData,
        createdAt,
        updatedAt,
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.createdAt).toEqual(createdAt);
        expect(result.value.updatedAt).toEqual(updatedAt);
      }
    });

    it('should fail with invalid name', () => {
      const result = Affiliate.create({
        ...validAffiliateData,
        nome: 'Ab',
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid code', () => {
      const result = Affiliate.create({
        ...validAffiliateData,
        codigo: 'ABC',
      });

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('updateName', () => {
    it('should update affiliate name', () => {
      const affiliateResult = Affiliate.create(validAffiliateData);
      expect(affiliateResult.isRight()).toBe(true);

      if (affiliateResult.isRight()) {
        const affiliate = affiliateResult.value;
        const originalUpdatedAt = affiliate.updatedAt;

        const newNameResult = AffiliateName.create('Jane Doe');
        expect(newNameResult.isRight()).toBe(true);

        if (newNameResult.isRight()) {
          const updateResult = affiliate.updateName(newNameResult.value);

          expect(updateResult.isRight()).toBe(true);
          expect(affiliate.nome.value).toBe('Jane Doe');
          expect(affiliate.updatedAt.getTime()).toBeGreaterThanOrEqual(
            originalUpdatedAt.getTime(),
          );
        }
      }
    });
  });

  describe('updateCode', () => {
    it('should update affiliate code', () => {
      const affiliateResult = Affiliate.create(validAffiliateData);
      expect(affiliateResult.isRight()).toBe(true);

      if (affiliateResult.isRight()) {
        const affiliate = affiliateResult.value;

        const newCodeResult = AffiliateCode.create('XYZ789');
        expect(newCodeResult.isRight()).toBe(true);

        if (newCodeResult.isRight()) {
          const updateResult = affiliate.updateCode(newCodeResult.value);

          expect(updateResult.isRight()).toBe(true);
          expect(affiliate.codigo.value).toBe('XYZ789');
        }
      }
    });
  });
});
