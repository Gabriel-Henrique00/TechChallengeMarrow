import { StatusPagamento } from '../../../shared/enums/status-pagamento.enum';
import { StatusTentativa } from '../../../shared/enums/status-tentativa.enum';
import { TentativaTransacao } from '../../payment-attempts/entities/tentativa-transacao.entity';
import { PaymentAlreadyPaidException } from '../../../shared/exceptions/payment-already-paid.exception';

export class Pagamento {
    id: string;
    clienteId: string;
    nomeCliente?: string;
    nome: string;
    descricao: string | null;
    valor: number;
    valorPago: number;
    status: StatusPagamento;
    idExterno: string | null;
    dataVencimento: Date;
    tentativas: TentativaTransacao[];
    criadoEm: Date;
    atualizadoEm: Date;

    podeReceberTentativa(): boolean {
        return this.status !== StatusPagamento.PAGO;
    }

    adicionarTentativa(tentativa: TentativaTransacao): void {
        if (!this.podeReceberTentativa()) {
            throw new PaymentAlreadyPaidException(this.id);
        }
        this.tentativas = [...(this.tentativas ?? []), tentativa];
    }

    marcarComoPago(valorPago: number): void {
        this.status = StatusPagamento.PAGO;
        this.valorPago = valorPago;
    }

    marcarComoNaoAutorizado(): void {
        this.status = StatusPagamento.NAO_AUTORIZADO;
    }

    ultimaTentativaSucedeu(): boolean {
        if (!this.tentativas?.length) return false;
        const ultima = this.tentativas.at(-1);
        return ultima?.status === StatusTentativa.SUCESSO;
    }
}