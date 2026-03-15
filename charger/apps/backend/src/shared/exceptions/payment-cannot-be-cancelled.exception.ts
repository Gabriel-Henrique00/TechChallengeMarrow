import { BadRequestException } from '@nestjs/common';

export class PaymentCannotBeCancelledException extends BadRequestException {
    constructor(pagamentoId: string, motivo: string) {
        super(`O pagamento ${pagamentoId} não pode ser cancelado: ${motivo}`);
    }
}