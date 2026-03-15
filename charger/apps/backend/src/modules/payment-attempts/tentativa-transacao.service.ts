import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { ITentativasTransacaoRepository } from './repositories/tentativa-transacao.repository';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { IPaymentProvider } from '../../integrations/payment-provider/provedor-pagamento.interface';
import { TentativaTransacaoMapper } from './mappers/tentativa-transacao.mapper';
import { TentativaRespostaDto } from './dto/tentativa-response.dto';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';
import { PaymentAlreadyPaidException } from '../../shared/exceptions/payment-already-paid.exception';
import { PagamentoModelo } from '../payment/models/pagamento.model';
import { PagamentoMapper } from '../payment/mapper/pagamento.mapper';
import { TentativaTransacaoModelo } from './models/tentativa-transacao.model';
import { TentativaTransacaoMapper as TTMapper } from './mappers/tentativa-transacao.mapper';

@Injectable()
export class TentativasTransacaoService {
    constructor(
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('IPaymentProvider')
        private readonly paymentProvider: IPaymentProvider,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async createPublico(pagamentoId: string): Promise<TentativaRespostaDto> {
        const existe = await this.pagamentosRepository.findByIdWithAttemptsInternal(pagamentoId);
        if (!existe) throw new ResourceNotFoundException('Pagamento', pagamentoId);
        return this.processarTentativa(pagamentoId);
    }

    async create(pagamentoId: string, usuarioId: string): Promise<TentativaRespostaDto> {
        const existe = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId, usuarioId);
        if (!existe) throw new ResourceNotFoundException('Pagamento', pagamentoId);
        return this.processarTentativa(pagamentoId);
    }

    async findByPaymentId(pagamentoId: string, usuarioId: string): Promise<TentativaRespostaDto[]> {
        const pagamento = await this.pagamentosRepository.findById(pagamentoId, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        const tentativas = await this.tentativasRepository.findByPaymentId(pagamentoId);

        // Deduplica tentativas com status SUCESSO no backend: mantém somente a mais
        // antiga, que representa o evento real de confirmação. As demais são
        // duplicatas disparadas pela Pluggy para o mesmo webhook.
        const jaViuSucesso = new Set<string>();
        const deduplicadas = tentativas.filter((t) => {
            if (t.status !== StatusTentativa.SUCESSO) return true;
            if (jaViuSucesso.has(t.pagamentoId)) return false;
            jaViuSucesso.add(t.pagamentoId);
            return true;
        });

        return deduplicadas.map((t) => TentativaTransacaoMapper.toResponseDto(t));
    }

    private async processarTentativa(pagamentoId: string): Promise<TentativaRespostaDto> {
        return this.dataSource.transaction(async (manager) => {
            const pagamentoModelo = await manager.findOne(PagamentoModelo, {
                where:     { id: pagamentoId },
                relations: ['cliente', 'tentativas'],
                lock:      { mode: 'pessimistic_write' },
            });

            if (!pagamentoModelo) throw new ResourceNotFoundException('Pagamento', pagamentoId);

            const pagamento = PagamentoMapper.toDomain(pagamentoModelo);

            if (pagamento.status === StatusPagamento.PAGO) {
                throw new PaymentAlreadyPaidException(pagamento.id);
            }

            if (pagamento.estaVencido()) {
                pagamento.marcarComoVencido();
                await manager.save(PagamentoModelo, PagamentoMapper.toModel(pagamento));
                throw new BadRequestException(
                    `O pagamento está vencido e não aceita novas tentativas.`,
                );
            }

            if (!pagamento.podeReceberTentativa()) {
                throw new BadRequestException(
                    'Este pagamento possui uma tentativa em andamento. ' +
                    'Aguarde 5 minutos antes de tentar novamente.',
                );
            }

            const resultado = await this.paymentProvider.initiatePayment({
                pagamentoId: pagamento.id,
                valor:       pagamento.valor,
                descricao:   pagamento.descricao ?? pagamento.nome,
            });

            const dadosTentativa             = TTMapper.fromCreateDto(pagamento.id, pagamento.valor);
            dadosTentativa.status            = resultado.status;
            dadosTentativa.referenciaExterna = resultado.referenciaExterna ?? null;
            dadosTentativa.motivoFalha       = resultado.motivoFalha ?? null;

            const tentativaModelo = manager.create(
                TentativaTransacaoModelo,
                TTMapper.toModel(dadosTentativa as any),
            );
            const tentativaSalva = await manager.save(TentativaTransacaoModelo, tentativaModelo);
            const tentativa      = TTMapper.toDomain(tentativaSalva);

            if (resultado.status === StatusTentativa.PENDENTE) {
                pagamento.marcarComoAguardando();
                await manager.save(PagamentoModelo, PagamentoMapper.toModel(pagamento));
            } else if (resultado.status === StatusTentativa.FALHA) {
                pagamento.adicionarTentativa(tentativa);
                pagamento.marcarComoNaoAutorizado();
                await manager.save(PagamentoModelo, PagamentoMapper.toModel(pagamento));
            }

            return TTMapper.toResponseDto(tentativa, resultado.paymentUrl);
        });
    }
}