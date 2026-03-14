import { StatusPagamento } from '../../../shared/enums/status-pagamento.enum';
import { StatusTentativa } from '../../../shared/enums/status-tentativa.enum';
import { TentativaTransacao } from '../../payment-attempts/entities/tentativa-transacao.entity';

export const EXPIRACAO_TENTATIVA_MS = 5 * 60 * 1000;

export class Pagamento {
    id: string;
    usuarioId: string;
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
        if (this.status === StatusPagamento.PAGO)    return false;
        if (this.status === StatusPagamento.VENCIDO) return false;
        if (new Date() > this.dataVencimento)        return false;

        const temPendenteAtivo = (this.tentativas ?? []).some((t) => {
            if (t.status !== StatusTentativa.PENDENTE) return false;
            const idadeMs = Date.now() - new Date(t.criadoEm).getTime();
            return idadeMs < EXPIRACAO_TENTATIVA_MS;
        });

        return !temPendenteAtivo;
    }

    estaVencido(): boolean {
        return (
            this.status !== StatusPagamento.PAGO &&
            new Date() > this.dataVencimento
        );
    }

    adicionarTentativa(tentativa: TentativaTransacao): void {
        this.tentativas = [...(this.tentativas ?? []), tentativa];
    }

    marcarComoPago(valorPago: number): void {
        this.status    = StatusPagamento.PAGO;
        this.valorPago = valorPago;
    }

    marcarComoNaoAutorizado(): void {
        this.status = StatusPagamento.NAO_AUTORIZADO;
    }

    marcarComoVencido(): void {
        this.status = StatusPagamento.VENCIDO;
    }

    ultimaTentativaSucedeu(): boolean {
        if (!this.tentativas?.length) return false;
        const ultima = this.tentativas.at(-1);
        return ultima?.status === StatusTentativa.SUCESSO;
    }
}