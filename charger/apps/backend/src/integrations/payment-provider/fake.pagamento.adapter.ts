import {Injectable} from '@nestjs/common';

import type {
    BancoDisponivel,
    IniciarPagamentoInput,
    IniciarPagamentoOutput,
    IPaymentProvider,
} from './provedor-pagamento.interface';
import {StatusTentativa} from "../../shared/enums/status-tentativa.enum";

@Injectable()
export class FakePaymentAdapter implements IPaymentProvider {
    async initiatePayment(input: IniciarPagamentoInput): Promise<IniciarPagamentoOutput> {
        // simula latência de uma chamada real
        await this.simularLatencia();

        const sorteio = Math.random();

        // 70% sucesso, 20% não autorizado, 10% falha
        if (sorteio < 0.7) {
            return {
                status:            StatusTentativa.SUCESSO,
                referenciaExterna: `fake-ref-${input.pagamentoId}-${Date.now()}`,
                motivoFalha:       null,
            };
        }

        if (sorteio < 0.9) {
            return {
                status:            StatusTentativa.NAO_AUTORIZADO,
                referenciaExterna: null,
                motivoFalha:       'Transação não autorizada pelo banco.',
            };
        }

        return {
            status:            StatusTentativa.FALHA,
            referenciaExterna: null,
            motivoFalha:       'Erro interno ao processar o pagamento.',
        };
    }

    async getAvailableBanks(): Promise<BancoDisponivel[]> {
        return [
            { id: '001', nome: 'Banco do Brasil'    },
            { id: '237', nome: 'Bradesco'           },
            { id: '341', nome: 'Itaú'               },
            { id: '033', nome: 'Santander'          },
            { id: '104', nome: 'Caixa Econômica'    },
            { id: '260', nome: 'Nu Pagamentos (Nubank)' },
        ];
    }

    private simularLatencia(): Promise<void> {
        const ms = Math.floor(Math.random() * 300) + 100; // 100ms a 400ms
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}