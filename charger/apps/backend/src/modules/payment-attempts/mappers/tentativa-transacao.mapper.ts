import { TentativaTransacao } from '../entities/tentativa-transacao.entity';
import { TentativaTransacaoModelo } from '../models/tentativa-transacao.model';

export class TentativaTransacaoMapper {
    static paraDominio(modelo: TentativaTransacaoModelo): TentativaTransacao {
        const tentativa = new TentativaTransacao();
        tentativa.id                = modelo.id;
        tentativa.pagamentoId       = modelo.pagamentoId;
        tentativa.status            = modelo.status;
        tentativa.idBanco           = modelo.idBanco;
        tentativa.nomeBanco         = modelo.bancoNome;
        tentativa.referenciaExterna = modelo.referenciaExterna;
        tentativa.motivoFalha       = modelo.motivoFalha;
        tentativa.valorTentativa    = Number(modelo.valorTentativa);
        tentativa.respostaWebhook   = modelo.respostaWebhook;
        tentativa.dataTentativa     = modelo.dataTentativa;
        tentativa.criadoEm          = modelo.criadoEm;
        return tentativa;
    }

    static paraModelo(tentativa: TentativaTransacao): Partial<TentativaTransacaoModelo> {
        return {
            pagamentoId:       tentativa.pagamentoId,
            status:            tentativa.status,
            idBanco:           tentativa.idBanco,
            bancoNome:         tentativa.nomeBanco,
            referenciaExterna: tentativa.referenciaExterna,
            motivoFalha:       tentativa.motivoFalha,
            valorTentativa:    tentativa.valorTentativa,
            respostaWebhook:   tentativa.respostaWebhook,
            dataTentativa:     tentativa.dataTentativa,
        };
    }
}