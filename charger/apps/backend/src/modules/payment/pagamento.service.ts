import { Injectable, Inject } from '@nestjs/common';
import type { IPagamentosRepository } from './repositories/pagamento.repository';
import type { IClientesRepository } from '../clients/repositories/clientes.repository';
import { PagamentoMapper } from './mapper/pagamento.mapper';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';
import { PagamentoRespostaDto } from './dto/pagamento-response.dto';
import { StatusPagamento } from '../../shared/enums/status-pagamento.enum';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';

@Injectable()
export class PagamentosService {
    constructor(
        @Inject('IPagamentosRepository')
        private readonly pagamentosRepository: IPagamentosRepository,
        @Inject('IClientesRepository')
        private readonly clientesRepository: IClientesRepository,
    ) {}

    async create(dto: CriarPagamentoDto): Promise<PagamentoRespostaDto> {
        const cliente = await this.clientesRepository.findById(dto.clienteId);
        if (!cliente) throw new ResourceNotFoundException('Cliente', dto.clienteId);

        const dados     = PagamentoMapper.fromCreateDto(dto);
        dados.status    = StatusPagamento.AGUARDANDO_PAGAMENTO;
        dados.valorPago = 0;

        const salvo = await this.pagamentosRepository.create(dados);
        return PagamentoMapper.toResponseDto(salvo, cliente.nome);
    }

    async findAll(): Promise<PagamentoRespostaDto[]> {
        const pagamentos = await this.pagamentosRepository.findAll();
        return pagamentos.map((p) =>
            PagamentoMapper.toResponseDto(p, p.nomeCliente ?? ''),
        );
    }

    async findById(id: string): Promise<PagamentoRespostaDto> {
        const pagamento = await this.pagamentosRepository.findById(id);
        if (!pagamento) throw new ResourceNotFoundException('Pagamento', id);
        return PagamentoMapper.toResponseDto(pagamento, pagamento.nomeCliente ?? '');
    }
}