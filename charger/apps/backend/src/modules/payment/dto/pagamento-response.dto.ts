export class PagamentoRespostaDto {
    id: string;
    clienteId: string;
    nomeCliente: string;
    nome: string;
    descricao: string | null;
    valor: number;
    valorPago: number;
    status: string;
    dataVencimento: string;
    criadoEm: string;
}