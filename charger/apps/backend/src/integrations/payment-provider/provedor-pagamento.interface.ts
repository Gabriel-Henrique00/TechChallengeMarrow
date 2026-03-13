import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

export interface IniciarPagamentoInput {
    pagamentoId: string;
    valor:       number;
    descricao?:  string;
}

export interface IniciarPagamentoOutput {
    status:            StatusTentativa;
    referenciaExterna: string | null; // paymentRequestId do Pluggy
    motivoFalha:       string | null;
    paymentUrl:        string | null; // https://pay.pluggy.ai/{id}
}

export interface BancoDisponivel {
    id:   string;
    nome: string;
}

export interface IPaymentProvider {
    initiatePayment(input: IniciarPagamentoInput): Promise<IniciarPagamentoOutput>;
    getAvailableBanks(): Promise<BancoDisponivel[]>;
}