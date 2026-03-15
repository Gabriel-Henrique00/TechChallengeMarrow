import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { ITentativasTransacaoRepository } from '../payment-attempts/repositories/tentativa-transacao.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';

const PLUGGY_EVENT_MAP: Record<string, StatusTentativa> = {
    'payment_intent/completed':                   StatusTentativa.SUCESSO,
    'payment_intent/error':                       StatusTentativa.FALHA,
    'payment_intent/waiting_payer_authorization': StatusTentativa.PENDENTE,
};

const PAYMENT_REQUEST_STATUS_MAP: Record<string, StatusTentativa> = {
    'COMPLETED': StatusTentativa.SUCESSO,
    'ERROR':     StatusTentativa.FALHA,
};

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);
    private readonly processando = new Map<string, Promise<void>>();

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

        const statusInterno = this.resolverStatus(event, payload);
        if (!statusInterno) {
            this.logger.log(`Evento sem mapeamento de status: ${event} — ignorado`);
            return;
        }

        const anterior = this.processando.get(paymentRequestId) ?? Promise.resolve();
        const atual = anterior.then(() =>
            this.processarComLock(paymentRequestId, event, statusInterno!, payload),
        );
        this.processando.set(paymentRequestId, atual);

        try {
            await atual;
        } finally {
            if (this.processando.get(paymentRequestId) === atual) {
                this.processando.delete(paymentRequestId);
            }
        }
    }

    private async processarComLock(
        paymentRequestId: string,
        event: string,
        statusInterno: StatusTentativa,
        payload: Record<string, any>,
    ): Promise<void> {
        const tentativa = await this.tentativasRepository.findByReferenciaExterna(paymentRequestId);
        if (!tentativa) {
            this.logger.warn(`Tentativa não encontrada para paymentRequestId: ${paymentRequestId}`);
            return;
        }

        // Não regride status já finalizado
        if (tentativa.status === StatusTentativa.SUCESSO && statusInterno !== StatusTentativa.SUCESSO) {
            this.logger.log(`Ignorando regressão de status: ${tentativa.status} → ${statusInterno}`);
            return;
        }

        if (tentativa.status === statusInterno && statusInterno === StatusTentativa.SUCESSO) {
            this.logger.log(`Evento duplicado ignorado: tentativa já está ${statusInterno}`);
            return;
        }


        const historicoAnterior = tentativa.respostaWebhook?.historico ?? [];
        const novoEvento = {
            event,
            statusAnterior: tentativa.status,
            statusNovo:     statusInterno,
            recebidoEm:     new Date().toISOString(),
            payload,
        };

        tentativa.status          = statusInterno;
        tentativa.respostaWebhook = {
            ultimoEvento: payload,
            historico:    [...historicoAnterior, novoEvento],
        };

        await this.tentativasRepository.update(tentativa);

        const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(tentativa.pagamentoId);
        if (!pagamento) return;

        if (statusInterno === StatusTentativa.SUCESSO) {
            if (pagamento.status === StatusPagamento.PAGO) {
                this.logger.log(`Pagamento ${pagamento.id} já está PAGO — evento ${event} ignorado.`);
                return;
            }

            pagamento.marcarComoPago(pagamento.valor);
            await this.pagamentosRepository.update(pagamento);
            this.logger.log(`Pagamento ${pagamento.id} → PAGO via webhook [${event}]`);

        } else if (statusInterno === StatusTentativa.FALHA) {
            pagamento.marcarComoNaoAutorizado();
            await this.pagamentosRepository.update(pagamento);
            this.logger.log(`Pagamento ${pagamento.id} → NAO_AUTORIZADO via webhook [${event}]`);
        }
    }

    private resolverStatus(event: string, payload: Record<string, any>): StatusTentativa | undefined {
        if (event === 'payment_request/updated') {
            return PAYMENT_REQUEST_STATUS_MAP[payload?.status as string];
        }
        return PLUGGY_EVENT_MAP[event];
    }
}