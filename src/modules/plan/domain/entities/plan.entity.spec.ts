import { Plan } from './plan.entity';
import { PlanName } from '../value-objects/plan-name.vo';
import { MonthlyPrice } from '../value-objects/monthly-price.vo';
import { Benefits } from '../value-objects/benefits.vo';

describe('Plan', () => {
  const validPlanData = {
    nome: 'Premium Plan',
    precoMensal: 99.99,
    beneficios: 'Access to all premium features and support',
  };

  describe('create', () => {
    it('should create a valid plan', () => {
      const result = Plan.create(validPlanData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.nome.value).toBe('Premium Plan');
        expect(result.value.precoMensal.value).toBe(99.99);
        expect(result.value.beneficios.value).toBe(
          'Access to all premium features and support',
        );
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should create plan with provided id', () => {
      const result = Plan.create(validPlanData, 'custom-id');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe('custom-id');
      }
    });

    it('should use provided dates', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const result = Plan.create({
        ...validPlanData,
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
      const result = Plan.create({
        ...validPlanData,
        nome: 'Ab',
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid price', () => {
      const result = Plan.create({
        ...validPlanData,
        precoMensal: -10,
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid benefits', () => {
      const result = Plan.create({
        ...validPlanData,
        beneficios: 'Short',
      });

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('updateName', () => {
    it('should update plan name', () => {
      const planResult = Plan.create(validPlanData);
      expect(planResult.isRight()).toBe(true);

      if (planResult.isRight()) {
        const plan = planResult.value;
        const newNameResult = PlanName.create('Basic Plan');

        if (newNameResult.isRight()) {
          plan.updateName(newNameResult.value);
          expect(plan.nome.value).toBe('Basic Plan');
        }
      }
    });
  });

  describe('updatePrice', () => {
    it('should update plan price', () => {
      const planResult = Plan.create(validPlanData);
      expect(planResult.isRight()).toBe(true);

      if (planResult.isRight()) {
        const plan = planResult.value;
        const newPriceResult = MonthlyPrice.create(49.99);

        if (newPriceResult.isRight()) {
          plan.updatePrice(newPriceResult.value);
          expect(plan.precoMensal.value).toBe(49.99);
        }
      }
    });
  });

  describe('updateBenefits', () => {
    it('should update plan benefits', () => {
      const planResult = Plan.create(validPlanData);
      expect(planResult.isRight()).toBe(true);

      if (planResult.isRight()) {
        const plan = planResult.value;
        const newBenefitsResult = Benefits.create('New benefits description');

        if (newBenefitsResult.isRight()) {
          plan.updateBenefits(newBenefitsResult.value);
          expect(plan.beneficios.value).toBe('New benefits description');
        }
      }
    });
  });
});
