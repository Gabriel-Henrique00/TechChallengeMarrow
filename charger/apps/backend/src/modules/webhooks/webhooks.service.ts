import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { ITentativasTransacaoRepository } from '../payment-attempts/repositories/tentativa-transacao.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

// Eventos do Pluggy → status interno
// Ref: https://docs.pluggy.ai/docs/webhooks
const PLUGGY_EVENT_MAP: Record<string, StatusTentativa> = {
    'payment_intent/completed':                  StatusTentativa.SUCESSO,
    'payment_intent/error':                      StatusTentativa.FALHA,
    'payment_request/completed':                 StatusTentativa.SUCESSO,
    'payment_intent/waiting_payer_authorization': StatusTentativa.PENDENTE,
};

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
    ) {}

    /**
     * Processa eventos de pagamento do Pluggy.
     *
     * Payload esperado:
     * {
     *   "id":    "event-uuid",
     *   "event": "payment_intent/completed",
     *   "data":  { "id": "intent-id", "paymentRequestId": "request-id" }
     * }
     */
    async processarPluggy(payload: Record<string, any>): Promise<void> {
        const event = payload?.event as string;

        const statusInterno = PLUGGY_EVENT_MAP[event];

        if (!statusInterno) {
            this.logger.log(`Evento Pluggy ignorado: ${event}`);
            return;
        }

        // O paymentRequestId é o que salvamos como referenciaExterna
        const paymentRequestId: string = payload?.data?.paymentRequestId ?? payload?.data?.id;

        if (!paymentRequestId) {
            this.logger.warn('Webhook Pluggy com payload incompleto.', payload);
            return;
        }

        const tentativa = await this.tentativasRepository.findByReferenciaExterna(paymentRequestId);
        if (!tentativa) {
            this.logger.warn(`Tentativa não encontrada para referenciaExterna: ${paymentRequestId}`);
            return;
        }

        tentativa.status          = statusInterno;
        tentativa.respostaWebhook = payload;
        await this.tentativasRepository.update(tentativa);

        // Atualiza pagamento conforme resultado
        const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(tentativa.pagamentoId);
        if (!pagamento) return;

        if (statusInterno === StatusTentativa.SUCESSO) {
            pagamento.marcarComoPago(pagamento.valor);
            await this.pagamentosRepository.update(pagamento);
        } else if (statusInterno === StatusTentativa.FALHA) {
            pagamento.marcarComoNaoAutorizado();
            await this.pagamentosRepository.update(pagamento);
        }

        this.logger.log(`Pagamento ${tentativa.pagamentoId} atualizado via webhook Pluggy [${event}]: ${statusInterno}`);
    }
}