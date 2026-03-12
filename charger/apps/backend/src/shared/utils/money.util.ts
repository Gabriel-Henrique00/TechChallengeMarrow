import Dinero from 'dinero.js';

Dinero.globalLocale = 'pt-BR';
Dinero.globalFormat = '$0,0.00';

export class MoneyUtil {

    static toDinero(valorDecimal: number | string): Dinero.Dinero {
        const floatVal = typeof valorDecimal === 'string' ? Number.parseFloat(valorDecimal) : valorDecimal;
        return Dinero({ amount: Math.round(floatVal * 100), currency: 'BRL' });
    }
    static toDecimal(dineroObj: Dinero.Dinero): number {
        return dineroObj.getAmount() / 100;
    }
}