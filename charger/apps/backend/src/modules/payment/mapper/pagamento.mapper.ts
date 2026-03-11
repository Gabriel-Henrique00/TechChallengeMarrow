import { Pagamento } from '../entities/pagamento.entity';
import { PagamentoModelo } from '../models/pagamento.model';
import { TentativaTransacaoMapper } from '../../payment-attempts/mappers/tentativa-transacao.mapper';

export class PagamentoMapper {
    static paraDominio(modelo: PagamentoModelo): Pagamento {
        const pagamento = new Pagamento();
        pagamento.id             = modelo.id;
        pagamento.clienteId      = modelo.clienteId;
        pagamento.nome           = modelo.nome;
        pagamento.descricao      = modelo.descricao;
        pagamento.valor          = Number(modelo.valor);
        pagamento.valorPago      = Number(modelo.valorPago);
        pagamento.status         = modelo.status;
        pagamento.idExterno      = modelo.idExterno;
        pagamento.dataVencimento = modelo.dataVencimento;
        pagamento.criadoEm       = modelo.criadoEm;
        pagamento.atualizadoEm   = modelo.atualizadoEm;
        pagamento.tentativas     = modelo.tentativas
            ? modelo.tentativas.map(TentativaTransacaoMapper.paraDominio)
            : [];
        return pagamento;
    }

    static paraModelo(pagamento: Pagamento): Partial<PagamentoModelo> {
        return {
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
}