import { Member } from './member.entity';
import { MemberName } from '../value-objects/member-name.vo';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

describe('Member', () => {
  const validMemberData = {
    nome: 'John Doe',
    email: 'john@example.com',
    telefone: '11999998888',
    planoId: 'plan-123',
    afiliadoId: 'affiliate-123',
    userId: 'user-123',
  };

  describe('create', () => {
    it('should create a valid member', () => {
      const result = Member.create(validMemberData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.nome.value).toBe('John Doe');
        expect(result.value.email.value).toBe('john@example.com');
        expect(result.value.telefone.value).toBe('11999998888');
        expect(result.value.planoId).toBe('plan-123');
        expect(result.value.afiliadoId).toBe('affiliate-123');
      }
    });

    it('should create member without affiliateId', () => {
      const result = Member.create({
        ...validMemberData,
        afiliadoId: undefined,
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.afiliadoId).toBeNull();
      }
    });

    it('should create member with null affiliateId', () => {
      const result = Member.create({
        ...validMemberData,
        afiliadoId: null,
      });

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.afiliadoId).toBeNull();
      }
    });

    it('should create member with provided id', () => {
      const result = Member.create(validMemberData, 'custom-id');

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id).toBe('custom-id');
      }
    });

    it('should fail with invalid name', () => {
      const result = Member.create({
        ...validMemberData,
        nome: 'Ab',
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = Member.create({
        ...validMemberData,
        email: 'invalid-email',
      });

      expect(result.isLeft()).toBe(true);
    });

    it('should fail with invalid phone', () => {
      const result = Member.create({
        ...validMemberData,
        telefone: '123',
      });

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('updateName', () => {
    it('should update member name', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        const newNameResult = MemberName.create('Jane Doe');

        if (newNameResult.isRight()) {
          member.updateName(newNameResult.value);
          expect(member.nome.value).toBe('Jane Doe');
        }
      }
    });
  });

  describe('updateEmail', () => {
    it('should update member email', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        const newEmailResult = Email.create('jane@example.com');

        if (newEmailResult.isRight()) {
          member.updateEmail(newEmailResult.value);
          expect(member.email.value).toBe('jane@example.com');
        }
      }
    });
  });

  describe('updatePhone', () => {
    it('should update member phone', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        const newPhoneResult = Phone.create('11888887777');

        if (newPhoneResult.isRight()) {
          member.updatePhone(newPhoneResult.value);
          expect(member.telefone.value).toBe('11888887777');
        }
      }
    });
  });

  describe('updatePlan', () => {
    it('should update member plan', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        member.updatePlan('new-plan-id');
        expect(member.planoId).toBe('new-plan-id');
      }
    });
  });

  describe('updateAffiliate', () => {
    it('should update member affiliate', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        member.updateAffiliate('new-affiliate-id');
        expect(member.afiliadoId).toBe('new-affiliate-id');
      }
    });

    it('should set affiliate to null', () => {
      const memberResult = Member.create(validMemberData);
      expect(memberResult.isRight()).toBe(true);

      if (memberResult.isRight()) {
        const member = memberResult.value;
        member.updateAffiliate(null);
        expect(member.afiliadoId).toBeNull();
      }
    });
  });
});
