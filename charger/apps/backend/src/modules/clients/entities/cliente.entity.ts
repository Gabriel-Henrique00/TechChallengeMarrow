export class Cliente {
    id: string;
    usuarioId: string;
    nome: string;
    email: string;
    telefone: string | null;
    documento: string;
    criadoEm: Date;
    atualizadoEm: Date;
}