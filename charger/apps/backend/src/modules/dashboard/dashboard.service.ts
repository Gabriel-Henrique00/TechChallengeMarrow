import { Injectable, Inject } from '@nestjs/common';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { MoneyUtil } from '../../shared/utils/money.util';

@Injectable()
export class DashboardService {
    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
    ) {}

    async buscarResumo() {
        const pagamentos = await this.pagamentosRepository.findAll();

        const zero = MoneyUtil.toDinero(0);

        const totalRecebidoDinero = pagamentos
            .filter((p) => p.status === StatusPagamento.PAGO)
            .reduce((acc, p) => acc.add(MoneyUtil.toDinero(p.valorPago)), zero);


        const totalAguardandoDinero = pagamentos
            .filter((p) => p.status === StatusPagamento.AGUARDANDO_PAGAMENTO)
            .reduce((acc, p) => acc.add(MoneyUtil.toDinero(p.valor)), zero);

        return {
            totalPagamentos:    pagamentos.length,
            totalRecebido:      MoneyUtil.toDecimal(totalRecebidoDinero),
            totalAguardando:    MoneyUtil.toDecimal(totalAguardandoDinero),
            totalNaoAutorizado: pagamentos.filter((p) => p.status === StatusPagamento.NAO_AUTORIZADO).length,
            totalCancelado:     pagamentos.filter((p) => p.status === StatusPagamento.CANCELADO).length,
            totalVencido:       pagamentos.filter((p) => p.status === StatusPagamento.VENCIDO).length,
            pagamentos:         pagamentos.map((p) => ({
                id:          p.id,
                nome:        p.nome,
                nomeCliente: p['cliente']?.nome ?? '',
                status:      p.status,
                valor:       p.valor,
                criadoEm:    p.criadoEm.toISOString(),
            })),
        };
    }
}