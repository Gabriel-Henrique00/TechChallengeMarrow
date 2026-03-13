import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

export interface IniciarPagamentoInput {
    pagamentoId:  string;
    valor:        number;
    idBanco:      string;
    descricao?:   string;
}

export interface IniciarPagamentoOutput {
    status:            StatusTentativa;
    referenciaExterna: string | null;
    motivoFalha:       string | null;
    paymentUrl:        string | null;
}

export interface BancoDisponivel {
    id:   string;
    nome: string;
}

export interface IPaymentProvider {
    initiatePayment(input: IniciarPagamentoInput): Promise<IniciarPagamentoOutput>;
    getAvailableBanks(): Promise<BancoDisponivel[]>;
}