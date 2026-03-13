import { Cliente } from '../entities/cliente.entity';

export interface IClientesRepository {
    create(cliente: Partial<Cliente>): Promise<Cliente>;
    findAll(usuarioId: string): Promise<Cliente[]>;
    findById(id: string, usuarioId: string): Promise<Cliente | null>;
    findByEmail(email: string, usuarioId: string): Promise<Cliente | null>;
    findByDocumento(documento: string, usuarioId: string): Promise<Cliente | null>;
}