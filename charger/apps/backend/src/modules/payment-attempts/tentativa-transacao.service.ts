import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITentativasTransacaoRepository } from './repositories/tentativa-transacao.repository';
import type { IPagamentosRepository } from '../payment/repositories/pagamento.repository';
import type { IPaymentProvider } from '../../integrations/payment-provider/provedor-pagamento.interface';
import { TentativaTransacaoMapper } from './mappers/tentativa-transacao.mapper';
import { CriarTentativaDto } from './dto/create-tentativa.dto';
import { TentativaRespostaDto } from './dto/tentativa-response.dto';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';
import { PaymentAlreadyPaidException } from '../../shared/exceptions/payment-already-paid.exception';
import { EXPIRACAO_TENTATIVA_MS } from '../payment/entities/pagamento.entity';

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

    async create(
        pagamentoId: string,
        dto: CriarTentativaDto,
        usuarioId: string,
    ): Promise<TentativaRespostaDto> {
        const pagamento = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        if (pagamento.status === StatusPagamento.PAGO) {
            throw new PaymentAlreadyPaidException(pagamentoId);
        }

        if (pagamento.estaVencido()) {
            pagamento.marcarComoVencido();
            await this.pagamentosRepository.update(pagamento);
            throw new BadRequestException(
                `O pagamento ${pagamentoId} está vencido e não aceita novas tentativas.`,
            );
        }

        await this.expirarTentativasPendentes(pagamento.tentativas ?? [], pagamentoId);

        const pagamentoAtualizado = await this.pagamentosRepository.findByIdWithAttempts(pagamentoId, usuarioId);

        if (!pagamentoAtualizado!.podeReceberTentativa()) {
            throw new BadRequestException(
                'Este pagamento possui uma tentativa em andamento. ' +
                'Aguarde 5 minutos antes de tentar novamente.',
            );
        }

        const resultado = await this.paymentProvider.initiatePayment({
            pagamentoId,
            valor:     pagamento.valor,
            descricao: pagamento.descricao ?? pagamento.nome,
        });

        const dadosTentativa             = TentativaTransacaoMapper.fromCreateDto(dto, pagamentoId, pagamento.valor);
        dadosTentativa.status            = resultado.status;
        dadosTentativa.referenciaExterna = resultado.referenciaExterna ?? null;
        dadosTentativa.motivoFalha       = resultado.motivoFalha ?? null;

        const tentativa = await this.tentativasRepository.create(dadosTentativa);

        if (resultado.status === StatusTentativa.FALHA) {
            pagamento.adicionarTentativa(tentativa);
            pagamento.marcarComoNaoAutorizado();
            await this.pagamentosRepository.update(pagamento);
        }

        return TentativaTransacaoMapper.toResponseDto(tentativa, resultado.paymentUrl);
    }

    async findByPaymentId(
        pagamentoId: string,
        usuarioId: string,
    ): Promise<TentativaRespostaDto[]> {
        const pagamento = await this.pagamentosRepository.findById(pagamentoId, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', pagamentoId);

        const tentativas = await this.tentativasRepository.findByPaymentId(pagamentoId);
        return tentativas.map((t) => TentativaTransacaoMapper.toResponseDto(t));
    }

    private async expirarTentativasPendentes(
        tentativas: Array<{ id: string; status: string; criadoEm: Date; pagamentoId?: string }>,
        pagamentoId: string,
    ): Promise<void> {
        const agora = Date.now();

        for (const t of tentativas) {
            if (t.status !== StatusTentativa.PENDENTE) continue;

            const idadeMs = agora - new Date(t.criadoEm).getTime();
            if (idadeMs < EXPIRACAO_TENTATIVA_MS) continue;

            const todas = await this.tentativasRepository.findByPaymentId(pagamentoId);
            const tentativaCompleta = todas.find((x) => x.id === t.id);
            if (!tentativaCompleta) continue;

            tentativaCompleta.status      = StatusTentativa.NAO_AUTORIZADO;
            tentativaCompleta.motivoFalha = 'Tempo limite de 5 minutos excedido sem confirmação do banco.';
            await this.tentativasRepository.update(tentativaCompleta);
        }
    }
}