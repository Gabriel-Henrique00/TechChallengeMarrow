import { Usuario } from '../entities/usuario.entity';

export interface IUsuariosRepository {
    create(usuario: Partial<Usuario>): Promise<Usuario>;
    findById(id: string): Promise<Usuario | null>;
    findByEmail(email: string): Promise<Usuario | null>;
    findByCnpj(cnpj: string): Promise<Usuario | null>;
    findAll(): Promise<Usuario[]>;
}