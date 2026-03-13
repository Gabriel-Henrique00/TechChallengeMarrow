import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { ITentativasTransacaoRepository } from '../payment-attempts/repositories/tentativa-transacao.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

const PLUGGY_STATUS_MAP: Record<string, StatusTentativa> = {
    COMPLETED:  StatusTentativa.SUCESSO,
    SUCCESS:    StatusTentativa.SUCESSO,
    FAILED:     StatusTentativa.FALHA,
    ERROR:      StatusTentativa.FALHA,
    CANCELLED:  StatusTentativa.NAO_AUTORIZADO,
    REJECTED:   StatusTentativa.NAO_AUTORIZADO,
    PROCESSING: StatusTentativa.PENDENTE,
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

    async processarPluggy(payload: Record<string, any>): Promise<void> {
        const event = payload?.event as string;

        if (event !== 'payment/status_updated') {
            this.logger.log(`Evento Pluggy ignorado: ${event}`);
            return;
        }

        const paymentIntentId: string = payload?.data?.paymentIntentId;
        const pluggyStatus:    string = payload?.data?.status;

        if (!paymentIntentId || !pluggyStatus) {
            this.logger.warn('Webhook Pluggy com payload incompleto.', payload);
            return;
        }

        const statusInterno = PLUGGY_STATUS_MAP[pluggyStatus] ?? StatusTentativa.FALHA;

        const tentativa = await this.tentativasRepository.findByReferenciaExterna(paymentIntentId);
        if (!tentativa) {
            this.logger.warn(`Tentativa não encontrada para referenciaExterna: ${paymentIntentId}`);
            return;
        }

        tentativa.status          = statusInterno;
        tentativa.respostaWebhook = payload;
        await this.tentativasRepository.update(tentativa);

        const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(tentativa.pagamentoId);
        if (!pagamento) return;

        if (statusInterno === StatusTentativa.SUCESSO) {
            pagamento.marcarComoPago(pagamento.valor);
            await this.pagamentosRepository.update(pagamento);
        } else if (statusInterno === StatusTentativa.NAO_AUTORIZADO) {
            pagamento.marcarComoNaoAutorizado();
            await this.pagamentosRepository.update(pagamento);
        }

        this.logger.log(`Pagamento ${tentativa.pagamentoId} atualizado via webhook Pluggy: ${statusInterno}`);
    }
}