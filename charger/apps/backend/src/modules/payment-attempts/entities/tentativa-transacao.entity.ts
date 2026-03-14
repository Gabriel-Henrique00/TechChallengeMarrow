import { StatusTentativa } from '../../../shared/enums/status-tentativa.enum';

export class TentativaTransacao {
    id: string;
    pagamentoId: string;
    status: StatusTentativa;
    referenciaExterna: string | null;
    motivoFalha: string | null;
    valorTentativa: number;
    respostaWebhook: Record<string, any> | null;
    dataTentativa: Date;
    criadoEm: Date;
}