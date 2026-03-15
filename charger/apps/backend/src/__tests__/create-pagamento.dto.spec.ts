import { HasTimezoneConstraint, IsFutureDateConstraint } from '../modules/payment/dto/create-pagamento.dto';

describe('HasTimezoneConstraint', () => {
    const constraint = new HasTimezoneConstraint();

    it('aceita offset Z (UTC)', () => {
        expect(constraint.validate('2026-04-15T00:00:00Z', {} as any)).toBe(true);
    });

    it('aceita offset negativo -03:00', () => {
        expect(constraint.validate('2026-04-15T00:00:00-03:00', {} as any)).toBe(true);
    });

    it('aceita offset positivo +05:30', () => {
        expect(constraint.validate('2026-04-15T00:00:00+05:30', {} as any)).toBe(true);
    });

    it('rejeita string sem offset', () => {
        expect(constraint.validate('2026-04-15T00:00:00', {} as any)).toBe(false);
    });

    it('rejeita string apenas com data', () => {
        expect(constraint.validate('2026-04-15', {} as any)).toBe(false);
    });

    it('retorna mensagem de erro descritiva', () => {
        expect(constraint.defaultMessage({} as any)).toContain('offset de fuso horário');
    });
});

describe('IsFutureDateConstraint', () => {
    const constraint = new IsFutureDateConstraint();

    it('aceita data futura com timezone', () => {
        const future = new Date(Date.now() + 86_400_000).toISOString();
        expect(constraint.validate(future, {} as any)).toBe(true);
    });

    it('rejeita data passada', () => {
        const past = new Date(Date.now() - 86_400_000).toISOString();
        expect(constraint.validate(past, {} as any)).toBe(false);
    });

    it('rejeita string inválida (NaN)', () => {
        expect(constraint.validate('nao-e-uma-data', {} as any)).toBe(false);
    });

    it('retorna mensagem de erro descritiva', () => {
        expect(constraint.defaultMessage({} as any)).toContain('data futura');
    });
});