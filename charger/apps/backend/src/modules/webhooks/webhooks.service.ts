import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { ITentativasTransacaoRepository } from '../payment-attempts/repositories/tentativa-transacao.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

const PLUGGY_EVENT_MAP: Record<string, StatusTentativa> = {
    'payment_intent/completed':                   StatusTentativa.SUCESSO,
    'payment_intent/error':                       StatusTentativa.FALHA,
    'payment_intent/waiting_payer_authorization': StatusTentativa.PENDENTE,
    'payment_request/updated':                    StatusTentativa.PENDENTE,
};

const PAYMENT_REQUEST_STATUS_MAP: Record<string, StatusTentativa> = {
    'COMPLETED': StatusTentativa.SUCESSO,
    'ERROR':     StatusTentativa.FALHA,
};

const TOLERANCIA_VALOR_CENTAVOS = 1;

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
    ) {}

    async processarPluggy(payload: Record<string, any>): Promise<void> {
        const event = payload?.event as string;

        this.logger.log(`Processando evento: ${event}`);

        const paymentRequestId: string =
            payload?.paymentRequestId ??
            payload?.data?.paymentRequestId ??
            payload?.data?.id;

        if (!paymentRequestId) {
            this.logger.warn(`Payload sem paymentRequestId — ignorado: ${event}`);
            return;
        }

        let statusInterno: StatusTentativa | undefined;

        if (event === 'payment_request/updated') {
            const requestStatus = payload?.status as string;
            statusInterno = PAYMENT_REQUEST_STATUS_MAP[requestStatus];

            if (!statusInterno) {
                this.logger.log(`payment_request/updated com status intermediário: ${requestStatus} — ignorado`);
                return;
            }
        } else {
            statusInterno = PLUGGY_EVENT_MAP[event];
        }

        if (!statusInterno) {
            this.logger.log(`Evento sem mapeamento de status: ${event} — ignorado`);
            return;
        }

        const tentativa = await this.tentativasRepository.findByReferenciaExterna(paymentRequestId);
        if (!tentativa) {
            this.logger.warn(`Tentativa não encontrada para paymentRequestId: ${paymentRequestId}`);
            return;
        }

        // Não regride status — se já está SUCESSO, não volta para PENDENTE ou FALHA
        if (
            tentativa.status === StatusTentativa.SUCESSO &&
            statusInterno !== StatusTentativa.SUCESSO
        ) {
            this.logger.log(`Ignorando regressão de status: ${tentativa.status} → ${statusInterno}`);
            return;
        }

        tentativa.status          = statusInterno;
        tentativa.respostaWebhook = payload;
        await this.tentativasRepository.update(tentativa);

        const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(tentativa.pagamentoId);
        if (!pagamento) return;

        if (statusInterno === StatusTentativa.SUCESSO) {
            const valorConfirmadoRaw: number | undefined =
                payload?.amount ??
                payload?.data?.amount ??
                payload?.data?.value;

            const valorConfirmado = valorConfirmadoRaw != null
                ? Number(valorConfirmadoRaw)
                : null;

            if (valorConfirmado == null || isNaN(valorConfirmado)) {
                this.logger.error(
                    `Webhook SUCESSO sem campo amount para pagamento ${pagamento.id}. ` +
                    `Payload: ${JSON.stringify(payload)}. Pagamento NÃO marcado como PAGO.`,
                );
                pagamento.marcarComoNaoAutorizado();
                await this.pagamentosRepository.update(pagamento);
                return;
            }

            const valorEsperadoCentavos = Math.round(pagamento.valor * 100);
            const valorRecebidoCentavos = Math.round(valorConfirmado * 100);
            const diferenca = Math.abs(valorEsperadoCentavos - valorRecebidoCentavos);

            if (diferenca > TOLERANCIA_VALOR_CENTAVOS) {
                this.logger.error(
                    `Divergência de valor no pagamento ${pagamento.id}: ` +
                    `esperado R$ ${pagamento.valor.toFixed(2)}, ` +
                    `recebido R$ ${valorConfirmado.toFixed(2)}. ` +
                    `Pagamento NÃO marcado como PAGO.`,
                );
                pagamento.marcarComoNaoAutorizado();
                await this.pagamentosRepository.update(pagamento);
                return;
            }

            pagamento.marcarComoPago(valorConfirmado);
            await this.pagamentosRepository.update(pagamento);
            this.logger.log(
                ` Pagamento ${pagamento.id} → PAGO via webhook [${event}] ` +
                `valor confirmado: R$ ${valorConfirmado.toFixed(2)}`,
            );
        } else if (statusInterno === StatusTentativa.FALHA) {
            pagamento.marcarComoNaoAutorizado();
            await this.pagamentosRepository.update(pagamento);
            this.logger.log(` Pagamento ${pagamento.id} → NAO_AUTORIZADO via webhook [${event}]`);
        }
    }
}