import { Pagamento } from '../entities/pagamento.entity';
import { PagamentoModelo } from '../models/pagamento.model';
import { CriarPagamentoDto } from '../dto/create-pagamento.dto';
import { PagamentoRespostaDto } from '../dto/pagamento-response.dto';
import { TentativaTransacaoMapper } from '../../payment-attempts/mappers/tentativa-transacao.mapper';

export class PagamentoMapper {
    static toDomain(modelo: PagamentoModelo): Pagamento {
        const pagamento          = new Pagamento();
        pagamento.id             = modelo.id;
        pagamento.usuarioId      = modelo.usuarioId;
        pagamento.clienteId      = modelo.clienteId;
        pagamento.nomeCliente    = modelo.cliente?.nome;
        pagamento.nome           = modelo.nome;
        pagamento.descricao      = modelo.descricao ?? null;
        pagamento.valor          = Number(modelo.valor);
        pagamento.valorPago      = Number(modelo.valorPago);
        pagamento.status         = modelo.status;
        pagamento.idExterno      = modelo.idExterno ?? null;
        pagamento.dataVencimento = modelo.dataVencimento;
        pagamento.criadoEm       = modelo.criadoEm;
        pagamento.atualizadoEm   = modelo.atualizadoEm;
        pagamento.tentativas     = modelo.tentativas
            ? modelo.tentativas.map(TentativaTransacaoMapper.toDomain)
            : [];
        return pagamento;
    }

    static toModel(pagamento: Pagamento): Partial<PagamentoModelo> {
        return {
            id:             pagamento.id,
            usuarioId:      pagamento.usuarioId,
            clienteId:      pagamento.clienteId,
            nome:           pagamento.nome,
            descricao:      pagamento.descricao,
            valor:          pagamento.valor,
            valorPago:      pagamento.valorPago,
            status:         pagamento.status,
            idExterno:      pagamento.idExterno,
            dataVencimento: pagamento.dataVencimento,
        };
    }

    static fromCreateDto(dto: CriarPagamentoDto, usuarioId: string): Partial<Pagamento> {
        const pagamento          = new Pagamento();
        pagamento.usuarioId      = usuarioId;
        pagamento.clienteId      = dto.clienteId;
        pagamento.nome           = dto.nome;
        pagamento.descricao      = dto.descricao ?? null;
        pagamento.valor          = dto.valor;
        pagamento.dataVencimento = new Date(dto.dataVencimento);
        return pagamento;
    }

    static toResponseDto(pagamento: Pagamento, nomeCliente: string): PagamentoRespostaDto {
        return {
            id:             pagamento.id,
            clienteId:      pagamento.clienteId,
            nomeCliente,
            nome:           pagamento.nome,
            descricao:      pagamento.descricao,
            valor:          pagamento.valor,
            valorPago:      pagamento.valorPago,
            status:         pagamento.status,
            dataVencimento: pagamento.dataVencimento.toISOString(),
            criadoEm:       pagamento.criadoEm.toISOString(),
        };
    }
}