import { Injectable, Inject } from '@nestjs/common';
import type { ITentativasTransacaoRepository } from './tentativa-transacao.repository';
import type { IPagamentosRepository } from '../payment/pagamento.repository';
import type { IPaymentProvider } from '../../integrations/payment-provider/provedor-pagamento.interface';
import { TentativaTransacaoMapper } from './mappers/tentativa-transacao.mapper';
import { CriarTentativaDto } from './dto/create-tentativa.dto';
import { TentativaRespostaDto } from './dto/tentativa-response.dto';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';

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

    async create(pagamentoId: string, dto: CriarTentativaDto): Promise<TentativaRespostaDto> {
        const pagamento = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        // regra de negócio validada na entidade
        pagamento.podeReceberTentativa();

        // cria tentativa com status inicial PROCESSANDO
        const dadosTentativa  = TentativaTransacaoMapper.fromCreateDto(dto, pagamentoId, pagamento.valor);
        dadosTentativa.status = StatusTentativa.PROCESSANDO;
        const tentativa       = await this.tentativasRepository.create(dadosTentativa);

        // chama provedor de pagamento (fake ou real)
        const resultado = await this.paymentProvider.initiatePayment({
            pagamentoId,
            valor:   pagamento.valor,
            idBanco: dto.idBanco,
        });

        // atualiza tentativa com resultado do provedor
        tentativa.status            = resultado.status;
        tentativa.referenciaExterna = resultado.referenciaExterna ?? null;
        tentativa.motivoFalha       = resultado.motivoFalha ?? null;
        await this.tentativasRepository.update(tentativa);

        // atualiza status do pagamento conforme resultado
        if (resultado.status === StatusTentativa.SUCESSO) {
            pagamento.marcarComoPago(pagamento.valor);
        }

        if (resultado.status === StatusTentativa.NAO_AUTORIZADO) {
            pagamento.marcarComoNaoAutorizado();
        }

        pagamento.adicionarTentativa(tentativa);
        await this.pagamentosRepository.update(pagamento);

        return TentativaTransacaoMapper.toResponseDto(tentativa);
    }

    async findByPaymentId(pagamentoId: string): Promise<TentativaRespostaDto[]> {
        const pagamento = await this.pagamentosRepository.findById(pagamentoId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        const tentativas = await this.tentativasRepository.findByPaymentId(pagamentoId);
        return tentativas.map(TentativaTransacaoMapper.toResponseDto);
    }
}