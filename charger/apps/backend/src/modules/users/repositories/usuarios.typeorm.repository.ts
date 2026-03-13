import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUsuariosRepository } from './usuarios.repository';
import { UsuarioModelo } from '../models/usuario.model';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioMapper } from '../mappers/usuario.mapper';

@Injectable()
export class UsuariosTypeOrmRepository implements IUsuariosRepository {
    constructor(
        @InjectRepository(UsuarioModelo)
        private readonly repositorio: Repository<UsuarioModelo>,
    ) {}

    async create(usuario: Partial<Usuario>): Promise<Usuario> {
        const modelo = this.repositorio.create(UsuarioMapper.toModel(usuario as Usuario));
        const salvo  = await this.repositorio.save(modelo);
        return UsuarioMapper.toDomain(salvo);
    }

    async findAll(): Promise<Usuario[]> {
        const modelos = await this.repositorio.find();
        return modelos.map(UsuarioMapper.toDomain);
    }

    async findById(id: string): Promise<Usuario | null> {
        const modelo = await this.repositorio.findOne({ where: { id } });
        return modelo ? UsuarioMapper.toDomain(modelo) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const modelo = await this.repositorio.findOne({ where: { email } });
        return modelo ? UsuarioMapper.toDomain(modelo) : null;
    }

    async findByCnpj(cnpj: string): Promise<Usuario | null> {
        const modelo = await this.repositorio.findOne({ where: { cnpj } });
        return modelo ? UsuarioMapper.toDomain(modelo) : null;
    }
}