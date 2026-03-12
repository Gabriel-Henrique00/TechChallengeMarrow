import { Injectable, Inject } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/pagamento.repository';
import type { ITentativasTransacaoRepository } from '../payment-attempts/tentativa-transacao.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

@Injectable()
export class WebhooksService {
    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
    ) {}

    async processar(payload: Record<string, any>, assinatura: string): Promise<void> {
        //depois lembrar do pluggy

        const { referenciaExterna, status, pagamentoId } = payload;

        const pagamento = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId);
        if (!pagamento) return;

        const tentativa = pagamento.tentativas.find(
            (t) => t.referenciaExterna === referenciaExterna,
        );
        if (!tentativa) return;

        // atualiza status da tentativa com resposta do webhook
        tentativa.status          = status;
        tentativa.respostaWebhook = payload;
        await this.tentativasRepository.update(tentativa);

        // atualiza status do pagamento conforme resultado
        if (status === StatusTentativa.SUCESSO) {
            pagamento.marcarComoPago(pagamento.valor);
        }

        if (status === StatusTentativa.NAO_AUTORIZADO) {
            pagamento.marcarComoNaoAutorizado();
        }

        await this.pagamentosRepository.update(pagamento);
    }
}