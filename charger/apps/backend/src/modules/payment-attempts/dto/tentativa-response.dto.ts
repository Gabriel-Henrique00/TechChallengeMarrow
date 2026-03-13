export class TentativaRespostaDto {
    id:                string;
    pagamentoId:       string;
    status:            string;
    idBanco:           string;
    nomeBanco:         string;
    referenciaExterna: string | null;
    motivoFalha:       string | null;
    valorTentativa:    number;
    paymentUrl:        string | null; // URL para o cliente concluir pagamento via Pluggy
    dataTentativa:     string;
    criadoEm:          string;
}