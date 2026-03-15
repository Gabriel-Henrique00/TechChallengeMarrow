import { Pagamento } from '../entities/pagamento.entity';

export interface IPagamentosRepository {
    create(pagamento: Partial<Pagamento>): Promise<Pagamento>;
    findAll(usuarioId: string): Promise<Pagamento[]>;
    findById(id: string, usuarioId: string): Promise<Pagamento | null>;
    findByIdWithAttempts(id: string, usuarioId: string): Promise<Pagamento | null>;
    findByIdWithAttemptsInternal(id: string): Promise<Pagamento | null>;
    update(pagamento: Pagamento): Promise<Pagamento>;
}