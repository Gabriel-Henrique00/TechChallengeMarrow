import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IClientesRepository } from './clientes.repository';
import { ClienteModelo } from '../models/cliente.model';
import { Cliente } from '../entities/cliente.entity';
import { ClienteMapper } from '../mappers/cliente.mapper';

@Injectable()
export class ClientesTypeOrmRepository implements IClientesRepository {
    constructor(
        @InjectRepository(ClienteModelo)
        private readonly repositorio: Repository<ClienteModelo>,
    ) {}

    async create(cliente: Partial<Cliente>): Promise<Cliente> {
        const modelo = this.repositorio.create(ClienteMapper.toModel(cliente as Cliente));
        const salvo  = await this.repositorio.save(modelo);
        return ClienteMapper.toDomain(salvo);
    }

    async findAll(usuarioId: string): Promise<Cliente[]> {
        const modelos = await this.repositorio.find({ where: { usuarioId } });
        return modelos.map(ClienteMapper.toDomain);
    }

    async findById(id: string, usuarioId: string): Promise<Cliente | null> {
        const modelo = await this.repositorio.findOne({ where: { id, usuarioId } });
        return modelo ? ClienteMapper.toDomain(modelo) : null;
    }

    async findByEmail(email: string): Promise<Cliente | null> {
        const modelo = await this.repositorio.findOne({ where: { email } });
        return modelo ? ClienteMapper.toDomain(modelo) : null;
    }

    async findByDocumento(documento: string): Promise<Cliente | null> {
        const modelo = await this.repositorio.findOne({ where: { documento } });
        return modelo ? ClienteMapper.toDomain(modelo) : null;
    }
}