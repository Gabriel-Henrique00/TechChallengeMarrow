import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import type { IPagamentosRepository } from './pagamento.repository';
import { PagamentoModelo } from '../models/pagamento.model';
import { Pagamento } from '../entities/pagamento.entity';
import { PagamentoMapper } from '../mapper/pagamento.mapper';

@Injectable()
export class PagamentosTypeOrmRepository implements IPagamentosRepository {
    constructor(
        @InjectRepository(PagamentoModelo)
        private readonly repositorio: Repository<PagamentoModelo>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async create(pagamento: Partial<Pagamento>): Promise<Pagamento> {
        const modelo = this.repositorio.create(PagamentoMapper.toModel(pagamento as Pagamento));
        const salvo  = await this.repositorio.save(modelo);
        return PagamentoMapper.toDomain(salvo);
    }

    async findAll(usuarioId: string): Promise<Pagamento[]> {
        const modelos = await this.repositorio.find({
            where:     { usuarioId },
            relations: ['cliente'],
            order:     { criadoEm: 'DESC' },
        });
        return modelos.map(PagamentoMapper.toDomain);
    }

    async findById(id: string, usuarioId: string): Promise<Pagamento | null> {
        const modelo = await this.repositorio.findOne({
            where:     { id, usuarioId },
            relations: ['cliente'],
        });
        return modelo ? PagamentoMapper.toDomain(modelo) : null;
    }

    async findByIdWithAttempts(id: string, usuarioId: string): Promise<Pagamento | null> {
        const modelo = await this.repositorio.findOne({
            where:     { id, usuarioId },
            relations: ['cliente', 'tentativas'],
        });
        return modelo ? PagamentoMapper.toDomain(modelo) : null;
    }

    async findByIdWithAttemptsInternal(id: string): Promise<Pagamento | null> {
        const modelo = await this.repositorio.findOne({
            where:     { id },
            relations: ['cliente', 'tentativas'],
        });
        return modelo ? PagamentoMapper.toDomain(modelo) : null;
    }

    async findByIdForUpdate(id: string): Promise<Pagamento | null> {
        const modelo = await this.dataSource
            .getRepository(PagamentoModelo)
            .findOne({
                where:     { id },
                relations: ['cliente', 'tentativas'],
                lock:      { mode: 'pessimistic_write' },
            });
        return modelo ? PagamentoMapper.toDomain(modelo) : null;
    }

    async update(pagamento: Pagamento): Promise<Pagamento> {
        await this.repositorio.save(PagamentoMapper.toModel(pagamento));
        return pagamento;
    }
}