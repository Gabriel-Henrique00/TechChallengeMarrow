export class TentativaRespostaDto {
    id:                string;
    pagamentoId:       string;
    status:            string;
    referenciaExterna: string | null;
    motivoFalha:       string | null;
    valorTentativa:    number;
    paymentUrl:        string | null;
    dataTentativa:     string;
    criadoEm:          string;
}