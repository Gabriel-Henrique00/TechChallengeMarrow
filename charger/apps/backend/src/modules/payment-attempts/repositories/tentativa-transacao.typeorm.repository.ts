import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import type { ITentativasTransacaoRepository } from './tentativa-transacao.repository';
import { TentativaTransacaoModelo } from '../models/tentativa-transacao.model';
import { TentativaTransacao } from '../entities/tentativa-transacao.entity';
import { TentativaTransacaoMapper } from '../mappers/tentativa-transacao.mapper';
import { StatusTentativa } from '../../../shared/enums/status-tentativa.enum';

@Injectable()
export class TentativasTransacaoTypeOrmRepository implements ITentativasTransacaoRepository {
    constructor(
        @InjectRepository(TentativaTransacaoModelo)
        private readonly repositorio: Repository<TentativaTransacaoModelo>,
    ) {}

    async create(tentativa: Partial<TentativaTransacao>): Promise<TentativaTransacao> {
        const modelo = this.repositorio.create(TentativaTransacaoMapper.toModel(tentativa as TentativaTransacao));
        const salvo  = await this.repositorio.save(modelo);
        return TentativaTransacaoMapper.toDomain(salvo);
    }

    async findByPaymentId(pagamentoId: string): Promise<TentativaTransacao[]> {
        const modelos = await this.repositorio.find({
            where: { pagamentoId },
            order: { criadoEm: 'DESC' },
        });
        return modelos.map(TentativaTransacaoMapper.toDomain);
    }

    async findByReferenciaExterna(referenciaExterna: string): Promise<TentativaTransacao | null> {
        const modelo = await this.repositorio.findOne({ where: { referenciaExterna } });
        return modelo ? TentativaTransacaoMapper.toDomain(modelo) : null;
    }

    async findPendentesAntesDe(dataLimite: Date): Promise<TentativaTransacao[]> {
        const modelos = await this.repositorio.find({
            where: {
                status:    StatusTentativa.PENDENTE,
                criadoEm:  LessThan(dataLimite),
            },
        });
        return modelos.map(TentativaTransacaoMapper.toDomain);
    }

    async update(tentativa: TentativaTransacao): Promise<TentativaTransacao> {
        await this.repositorio.save(TentativaTransacaoMapper.toModel(tentativa));
        return tentativa;
    }
}