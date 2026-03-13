import { Injectable, Inject } from '@nestjs/common';
import type { ITentativasTransacaoRepository } from './repositories/tentativa-transacao.repository';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { IPaymentProvider } from '../../integrations/payment-provider/provedor-pagamento.interface';
import { TentativaTransacaoMapper } from './mappers/tentativa-transacao.mapper';
import { CriarTentativaDto } from './dto/create-tentativa.dto';
import { TentativaRespostaDto } from './dto/tentativa-response.dto';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';
import { PaymentAlreadyPaidException } from '../../shared/exceptions/payment-already-paid.exception';

@Injectable()
export class TentativasTransacaoService {
    constructor(
        @Inject('ITentativasTransacaoRepository')
        private readonly tentativasRepository: ITentativasTransacaoRepository,
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('IPaymentProvider')
        private readonly paymentProvider: IPaymentProvider,
    ) {}

    async create(pagamentoId: string, dto: CriarTentativaDto, usuarioId: string): Promise<TentativaRespostaDto> {
        const pagamento = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        if (!pagamento.podeReceberTentativa()) {
            throw new PaymentAlreadyPaidException(pagamentoId);
        }

        // Cria o Payment Request no Pluggy e obtém o paymentUrl
        const resultado = await this.paymentProvider.initiatePayment({
            pagamentoId,
            valor:    pagamento.valor,
            descricao: pagamento.descricao ?? pagamento.nome,
        });

        const dadosTentativa             = TentativaTransacaoMapper.fromCreateDto(dto, pagamentoId, pagamento.valor);
        dadosTentativa.status            = resultado.status;
        dadosTentativa.referenciaExterna = resultado.referenciaExterna ?? null;
        dadosTentativa.motivoFalha       = resultado.motivoFalha ?? null;

        const tentativa = await this.tentativasRepository.create(dadosTentativa);

        pagamento.adicionarTentativa(tentativa);

        // Só atualiza status do pagamento em resposta síncrona (FALHA)
        // SUCESSO e NAO_AUTORIZADO chegam via webhook do Pluggy
        if (resultado.status === StatusTentativa.FALHA) {
            await this.pagamentosRepository.update(pagamento);
        }

        return TentativaTransacaoMapper.toResponseDto(tentativa, resultado.paymentUrl);
    }

    async findByPaymentId(pagamentoId: string, usuarioId: string): Promise<TentativaRespostaDto[]> {
        const pagamento = await this.pagamentosRepository.findById(pagamentoId, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        const tentativas = await this.tentativasRepository.findByPaymentId(pagamentoId);
        return tentativas.map((t) => TentativaTransacaoMapper.toResponseDto(t));
    }

    async getAvailableBanks() {
        return this.paymentProvider.getAvailableBanks();
    }
}