import { BadRequestException } from '@nestjs/common';

export class PaymentAlreadyPaidException extends BadRequestException {
    constructor(pagamentoId: string) {
        super(`O pagamento ${pagamentoId} já foi pago e não aceita novas tentativas.`);
    }
}