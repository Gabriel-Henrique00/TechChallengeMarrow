import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
    IniciarPagamentoInput,
    IniciarPagamentoOutput,
    IPaymentProvider,
} from './provedor-pagamento.interface';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

interface PluggyApiKeyCache {
    apiKey:    string;
    expiresAt: number;
}

interface PluggyPaymentRequestResponse {
    id:         string;
    status:     string;
    paymentUrl: string;
}

@Injectable()
export class PluggyPaymentAdapter implements IPaymentProvider {
    private readonly logger       = new Logger(PluggyPaymentAdapter.name);
    private readonly baseUrl      = 'https://api.pluggy.ai';
    private readonly clientId:     string;
    private readonly clientSecret: string;
    private readonly recipientId:  string;
    private readonly frontendUrl:  string;

    private cachedApiKey: PluggyApiKeyCache | null = null;

    constructor(private readonly configService: ConfigService) {
        this.clientId     = this.configService.get<string>('pluggy.clientId')     ?? '';
        this.clientSecret = this.configService.get<string>('pluggy.clientSecret') ?? '';
        this.recipientId  = this.configService.get<string>('pluggy.recipientId')  ?? '';
        this.frontendUrl  = this.configService.get<string>('app.frontendUrl')     ?? 'http://localhost:3001';
    }

    async initiatePayment(input: IniciarPagamentoInput): Promise<IniciarPagamentoOutput> {
        try {
            if (!this.recipientId) {
                throw new Error('PLUGGY_RECIPIENT_ID não configurado no .env');
            }

            const apiKey = await this.getApiKey();

            const body = {
                amount:      input.valor,
                description: input.descricao ?? `Pagamento #${input.pagamentoId}`,
                recipientId: this.recipientId,
                callbackUrls: {
                    success: `${this.frontendUrl}/checkout?id=${input.pagamentoId}&result=success`,
                    error:   `${this.frontendUrl}/checkout?id=${input.pagamentoId}&result=error`,
                    pending: `${this.frontendUrl}/checkout?id=${input.pagamentoId}&result=pending`,
                },
            };

            const response = await fetch(`${this.baseUrl}/payments/requests`, {
                method:  'POST',
                headers: {
                    'X-API-KEY':    apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Pluggy /payments/requests falhou [${response.status}]: ${err}`);
            }

            const data: PluggyPaymentRequestResponse = await response.json();

            this.logger.log(`Payment Request criado: ${data.id} → ${data.paymentUrl}`);

            return {
                status:            StatusTentativa.PENDENTE,
                referenciaExterna: data.id,
                motivoFalha:       null,
                paymentUrl:        data.paymentUrl,
            };
        } catch (error: any) {
            this.logger.error('Erro ao criar Payment Request no Pluggy', error?.message);
            return {
                status:            StatusTentativa.FALHA,
                referenciaExterna: null,
                motivoFalha:       error?.message ?? 'Erro ao comunicar com o provedor de pagamento.',
                paymentUrl:        null,
            };
        }
    }

    private async getApiKey(): Promise<string> {
        const margem = 5 * 60 * 1000;

        if (this.cachedApiKey && this.cachedApiKey.expiresAt > Date.now() + margem) {
            return this.cachedApiKey.apiKey;
        }

        const response = await fetch(`${this.baseUrl}/auth`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                clientId:     this.clientId,
                clientSecret: this.clientSecret,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Falha na autenticação com o Pluggy [${response.status}]: ${err}`);
        }

        const data: { apiKey: string } = await response.json();

        this.cachedApiKey = {
            apiKey:    data.apiKey,
            expiresAt: Date.now() + 2 * 60 * 60 * 1000,
        };

        this.logger.log('Pluggy: novo apiKey obtido com sucesso.');
        return data.apiKey;
    }
}