export class TentativaRespostaDto {
    id: string;
    pagamentoId: string;
    status: string;
    idBanco: string;
    nomeBanco: string;
    referenciaExterna: string | null;
    motivoFalha: string | null;
    valorTentativa: number;
    dataTentativa: string;
    criadoEm: string;
}