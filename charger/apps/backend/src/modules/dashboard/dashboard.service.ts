import { Injectable, Inject } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';

@Injectable()
export class DashboardService {
    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
    ) {}

    async buscarResumo(usuarioId: string) {
        const pagamentos = await this.pagamentosRepository.findAll(usuarioId);

        const totalRecebido = pagamentos
            .filter((p) => p.status === StatusPagamento.PAGO)
            .reduce((acc, p) => acc + p.valorPago, 0);

        const totalAguardando = pagamentos
            .filter((p) => p.status === StatusPagamento.AGUARDANDO_PAGAMENTO)
            .reduce((acc, p) => acc + p.valor, 0);

        return {
            totalPagamentos:    pagamentos.length,
            totalRecebido,
            totalAguardando,
            totalNaoAutorizado: pagamentos.filter((p) => p.status === StatusPagamento.NAO_AUTORIZADO).length,
            totalCancelado:     pagamentos.filter((p) => p.status === StatusPagamento.CANCELADO).length,
            totalVencido:       pagamentos.filter((p) => p.status === StatusPagamento.VENCIDO).length,
            pagamentos:         pagamentos.map((p) => ({
                id:          p.id,
                nome:        p.nome,
                nomeCliente: p.nomeCliente ?? '',
                status:      p.status,
                valor:       p.valor,
                criadoEm:    p.criadoEm.toISOString(),
            })),
        };
    }
}