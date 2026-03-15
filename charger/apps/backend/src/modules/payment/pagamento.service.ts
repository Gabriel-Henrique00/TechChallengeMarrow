import { Injectable, Inject } from '@nestjs/common';
import type { IPagamentosRepository } from './repositories/pagamento.repository';
import type { IClientesRepository } from '../clients/repositories/clientes.repository';
import { PagamentoMapper } from './mapper/pagamento.mapper';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';
import { PagamentoRespostaDto } from './dto/pagamento-response.dto';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';
import { PaymentCannotBeCancelledException } from '../../shared/exceptions/payment-cannot-be-cancelled.exception';

export interface PagamentoPublicoDto {
    id:             string;
    nome:           string;
    descricao:      string | null;
    valor:          number;
    status:         string;
    dataVencimento: string;
    nomeCliente:    string;
}

@Injectable()
export class PagamentosService {
    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('IClientesRepository')
        private readonly clientesRepository: IClientesRepository,
    ) {}

    async create(dto: CriarPagamentoDto, usuarioId: string): Promise<PagamentoRespostaDto> {
        const cliente = await this.clientesRepository.findById(dto.clienteId, usuarioId);
        if (!cliente) throw new ResourceNotFoundException('Cliente', dto.clienteId);

        const dados     = PagamentoMapper.fromCreateDto(dto, usuarioId);
        dados.status    = StatusPagamento.AGUARDANDO_PAGAMENTO;
        dados.valorPago = 0;

        const salvo = await this.pagamentosRepository.create(dados);
        return PagamentoMapper.toResponseDto(salvo, cliente.nome);
    }

    async findAll(usuarioId: string): Promise<PagamentoRespostaDto[]> {
        const pagamentos = await this.pagamentosRepository.findAll(usuarioId);
        return pagamentos.map((p) =>
            PagamentoMapper.toResponseDto(p, p.nomeCliente ?? ''),
        );
    }

    async findById(id: string, usuarioId: string): Promise<PagamentoRespostaDto> {
        const pagamento = await this.pagamentosRepository.findById(id, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', id);
        return PagamentoMapper.toResponseDto(pagamento, pagamento.nomeCliente ?? '');
    }

    async findByIdPublico(id: string): Promise<PagamentoPublicoDto> {
        const pagamento = await this.pagamentosRepository.findByIdWithAttemptsInternal(id);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', id);

        return {
            id:             pagamento.id,
            nome:           pagamento.nome,
            descricao:      pagamento.descricao,
            valor:          pagamento.valor,
            status:         pagamento.status,
            dataVencimento: pagamento.dataVencimento.toISOString(),
            nomeCliente:    pagamento.nomeCliente ?? '',
        };
    }

    async cancel(id: string, usuarioId: string): Promise<PagamentoRespostaDto> {
        const pagamento = await this.pagamentosRepository.findById(id, usuarioId);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', id);

        if (!pagamento.podeCancelar()) {
            const motivos: Record<string, string> = {
                PAGO:      'já foi pago.',
                VENCIDO:   'está vencido.',
                CANCELADO: 'já foi cancelado.',
            };
            const motivo = motivos[pagamento.status] ?? `status atual é ${pagamento.status}.`;
            throw new PaymentCannotBeCancelledException(id, motivo);
        }

        pagamento.marcarComoCancelado();
        const atualizado = await this.pagamentosRepository.update(pagamento);
        return PagamentoMapper.toResponseDto(atualizado, atualizado.nomeCliente ?? '');
    }
}