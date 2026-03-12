import { Cliente } from './entities/cliente.entity';

export interface IClientesRepository {
    create(cliente: Partial<Cliente>): Promise<Cliente>;
    findAll(): Promise<Cliente[]>;
    findById(id: string): Promise<Cliente | null>;
    findByEmail(email: string): Promise<Cliente | null>;
    findByDocumento(documento: string): Promise<Cliente | null>;
}