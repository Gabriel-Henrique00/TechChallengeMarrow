import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { ITentativasTransacaoRepository } from './repositories/tentativa-transacao.repository';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { EXPIRACAO_TENTATIVA_MS } from '../payment/entities/pagamento.entity';

@Injectable()
export class PaymentExpiryScheduler {
    private readonly logger = new Logger(PaymentExpiryScheduler.name);

    constructor(
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async expirarTentativasAntigas(): Promise<void> {
        const dataLimite = new Date(Date.now() - EXPIRACAO_TENTATIVA_MS);

        try {
            const pendentes = await this.tentativasRepository.findPendentesAntesDe(dataLimite);
            if (pendentes.length === 0) return;

            this.logger.log(`Expirando ${pendentes.length} tentativa(s) com mais de 5 minutos...`);

            for (const tentativa of pendentes) {
                tentativa.status      = StatusTentativa.NAO_AUTORIZADO;
                tentativa.motivoFalha = 'Tempo limite de 5 minutos excedido sem confirmação do banco.';
                await this.tentativasRepository.update(tentativa);

                const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(
                    tentativa.pagamentoId,
                );
                if (!pagamento) continue;

                if (pagamento.status === StatusPagamento.AGUARDANDO_PAGAMENTO) {
                    const temPendenteAtivo = pagamento.tentativas.some(
                        (t) =>
                            t.status === StatusTentativa.PENDENTE &&
                            t.id !== tentativa.id,
                    );

                    if (!temPendenteAtivo) {
                        pagamento.marcarComoNaoAutorizado();
                        await this.pagamentosRepository.update(pagamento);
                        this.logger.log(`Pagamento ${pagamento.id} → NAO_AUTORIZADO (tentativa expirou).`);
                    }
                }

                if (pagamento.estaVencido() && pagamento.status !== StatusPagamento.PAGO) {
                    pagamento.marcarComoVencido();
                    await this.pagamentosRepository.update(pagamento);
                    this.logger.log(`Pagamento ${pagamento.id} → VENCIDO.`);
                }
            }
        } catch (error: any) {
            this.logger.error('Erro no scheduler de expiração', error?.message);
        }
    }
}