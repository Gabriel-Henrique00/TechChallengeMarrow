import { MoneyUtil } from '../shared/utils/money.util';

describe('MoneyUtil', () => {
    describe('toDinero()', () => {
        it('converte número decimal para Dinero em centavos', () => {
            expect(MoneyUtil.toDinero(150.50).getAmount()).toBe(15050);
        });

        it('converte string decimal para Dinero', () => {
            expect(MoneyUtil.toDinero('99.99').getAmount()).toBe(9999);
        });

        it('arredonda corretamente valores com ponto flutuante impreciso', () => {
            expect(MoneyUtil.toDinero(0.1 + 0.2).getAmount()).toBe(30);
        });

        it('converte zero', () => {
            expect(MoneyUtil.toDinero(0).getAmount()).toBe(0);
        });

        it('converte valor inteiro sem casas decimais', () => {
            expect(MoneyUtil.toDinero(100).getAmount()).toBe(10000);
        });

        it('define currency como BRL', () => {
            expect(MoneyUtil.toDinero(10).getCurrency()).toBe('BRL');
        });
    });

    describe('toDecimal()', () => {
        it('converte Dinero de volta para decimal', () => {
            expect(MoneyUtil.toDecimal(MoneyUtil.toDinero(150.50))).toBe(150.50);
        });

        it('retorna zero para amount zero', () => {
            expect(MoneyUtil.toDecimal(MoneyUtil.toDinero(0))).toBe(0);
        });

        it('round-trip mantém valor original', () => {
            expect(MoneyUtil.toDecimal(MoneyUtil.toDinero(99.99))).toBe(99.99);
        });
    });
});