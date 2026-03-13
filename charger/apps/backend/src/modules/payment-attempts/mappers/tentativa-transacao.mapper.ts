import { TentativaTransacao } from '../entities/tentativa-transacao.entity';
import { TentativaTransacaoModelo } from '../models/tentativa-transacao.model';
import { CriarTentativaDto } from '../dto/create-tentativa.dto';
import { TentativaRespostaDto } from '../dto/tentativa-response.dto';

export class TentativaTransacaoMapper {
    static toDomain(modelo: TentativaTransacaoModelo): TentativaTransacao {
        const tentativa = new TentativaTransacao();
        tentativa.id                = modelo.id;
        tentativa.pagamentoId       = modelo.pagamentoId;
        tentativa.status            = modelo.status;
        tentativa.idBanco           = modelo.idBanco;
        tentativa.nomeBanco         = modelo.bancoNome;
        tentativa.referenciaExterna = modelo.referenciaExterna ?? null;
        tentativa.motivoFalha       = modelo.motivoFalha ?? null;
        tentativa.valorTentativa    = Number(modelo.valorTentativa);
        tentativa.respostaWebhook   = modelo.respostaWebhook ?? null;
        tentativa.dataTentativa     = modelo.dataTentativa;
        tentativa.criadoEm          = modelo.criadoEm;
        return tentativa;
    }

    static toModel(tentativa: TentativaTransacao): Partial<TentativaTransacaoModelo> {
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

    static fromCreateDto(dto: CriarTentativaDto, pagamentoId: string, valor: number): Partial<TentativaTransacao> {
        const tentativa = new TentativaTransacao();
        tentativa.pagamentoId    = pagamentoId;
        tentativa.idBanco        = dto.idBanco;
        tentativa.nomeBanco      = dto.nomeBanco;
        tentativa.valorTentativa = valor;
        tentativa.dataTentativa  = new Date();
        return tentativa;
    }

    static toResponseDto(tentativa: TentativaTransacao, paymentUrl: string | null = null): TentativaRespostaDto {
        return {
            id:                tentativa.id,
            pagamentoId:       tentativa.pagamentoId,
            status:            tentativa.status,
            idBanco:           tentativa.idBanco,
            nomeBanco:         tentativa.nomeBanco,
            referenciaExterna: tentativa.referenciaExterna,
            motivoFalha:       tentativa.motivoFalha,
            valorTentativa:    tentativa.valorTentativa,
            paymentUrl,
            dataTentativa:     tentativa.dataTentativa.toISOString(),
            criadoEm:          tentativa.criadoEm.toISOString(),
        };
    }
}