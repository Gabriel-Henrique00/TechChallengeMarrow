import { TentativaTransacao } from '../entities/tentativa-transacao.entity';

export interface ITentativasTransacaoRepository {
    create(tentativa: Partial<TentativaTransacao>): Promise<TentativaTransacao>;
    findByPaymentId(pagamentoId: string): Promise<TentativaTransacao[]>;
    findByReferenciaExterna(referenciaExterna: string): Promise<TentativaTransacao | null>;
    findPendentesAntesDe(dataLimite: Date): Promise<TentativaTransacao[]>;
    update(tentativa: TentativaTransacao): Promise<TentativaTransacao>;
}