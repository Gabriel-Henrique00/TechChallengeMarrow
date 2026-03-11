import { Pagamento } from './entities/pagamento.entity';

export interface IPagamentosRepository {
    create(pagamento: Partial<Pagamento>): Promise<Pagamento>;
    findAll(): Promise<Pagamento[]>;
    findById(id: string): Promise<Pagamento | null>;
    findByIdWithAttempts(id: string): Promise<Pagamento | null>;
    update(pagamento: Pagamento): Promise<Pagamento>;
}