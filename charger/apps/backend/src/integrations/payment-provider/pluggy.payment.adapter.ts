import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
    BancoDisponivel,
    IniciarPagamentoInput,
    IniciarPagamentoOutput,
    IPaymentProvider,
} from './provedor-pagamento.interface';
import { StatusTentativa } from '../../shared/enums/status-tentativa.enum';

interface PluggyApiKey {
    apiKey:    string;
    expiresAt: number; // timestamp ms
}

interface PluggyConnector {
    id:   number;
    name: string;
}

interface PluggyPaymentIntentResponse {
    id:          string;
    status:      string;
    callbackUrl: string | null;
}

interface PluggyConnectTokenResponse {
    accessToken: string;
}

@Injectable()
export class PluggyPaymentAdapter implements IPaymentProvider {
    private readonly logger    = new Logger(PluggyPaymentAdapter.name);
    private readonly baseUrl   = 'https://api.pluggy.ai';
    private readonly clientId:     string;
    private readonly clientSecret: string;
    private readonly appBaseUrl:   string;

    private cachedApiKey: PluggyApiKey | null = null;

    constructor(private readonly configService: ConfigService) {
        this.clientId     = this.configService.get<string>('pluggy.clientId')     ?? '';
        this.clientSecret = this.configService.get<string>('pluggy.clientSecret') ?? '';
        this.appBaseUrl   = this.configService.get<string>('app.baseUrl')         ?? 'http://localhost:3001';
    }

    // ─── IPaymentProvider ────────────────────────────────────────────────────

    async initiatePayment(input: IniciarPagamentoInput): Promise<IniciarPagamentoOutput> {
        try {
            const apiKey = await this.getApiKey();

            // 1. Cria o Payment Intent no Pluggy
            const paymentIntent = await this.criarPaymentIntent(apiKey, input);

            // 2. Cria o Connect Token para o widget do cliente
            const connectToken = await this.criarConnectToken(apiKey, paymentIntent.id, input);

            const paymentUrl = this.buildWidgetUrl(connectToken);

            return {
                status:            StatusTentativa.PENDENTE,
                referenciaExterna: paymentIntent.id,
                motivoFalha:       null,
                paymentUrl,
            };
        } catch (error: any) {
            this.logger.error('Erro ao iniciar pagamento no Pluggy', error?.message);
            return {
                status:            StatusTentativa.FALHA,
                referenciaExterna: null,
                motivoFalha:       error?.message ?? 'Erro ao comunicar com o provedor de pagamento.',
                paymentUrl:        null,
            };
        }
    }

    async getAvailableBanks(): Promise<BancoDisponivel[]> {
        try {
            const apiKey = await this.getApiKey();

            const response = await fetch(
                `${this.baseUrl}/connectors?supportsPaymentInitiation=true`,
                {
                    headers: {
                        'X-API-KEY':    apiKey,
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Pluggy retornou status ${response.status} ao buscar conectores`);
            }

            const data: { results: PluggyConnector[] } = await response.json();

            return data.results.map((c) => ({
                id:   String(c.id),
                nome: c.name,
            }));
        } catch (error: any) {
            this.logger.error('Erro ao buscar bancos disponíveis no Pluggy', error?.message);
            return [];
        }
    }

    // ─── Internos ────────────────────────────────────────────────────────────

    private async criarPaymentIntent(
        apiKey:  string,
        input:   IniciarPagamentoInput,
    ): Promise<PluggyPaymentIntentResponse> {
        const body = {
            type:        'PIX',
            amount:      input.valor,
            description: input.descricao ?? `Pagamento #${input.pagamentoId}`,
            callbackUrls: {
                success: `${this.appBaseUrl}/payment/${input.pagamentoId}/success`,
                error:   `${this.appBaseUrl}/payment/${input.pagamentoId}/error`,
            },
        };

        const response = await fetch(`${this.baseUrl}/payments`, {
            method:  'POST',
            headers: {
                'X-API-KEY':    apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Pluggy /payments falhou [${response.status}]: ${err}`);
        }

        return response.json();
    }

    private async criarConnectToken(
        apiKey:         string,
        paymentIntentId: string,
        input:          IniciarPagamentoInput,
    ): Promise<string> {
        const body = {
            clientUserId: input.pagamentoId,
            options: {
                connectorIds: [Number(input.idBanco)],
                products:     ['PAYMENT_INITIATION'],
                paymentData: {
                    paymentIntentId,
                },
            },
        };

        const response = await fetch(`${this.baseUrl}/connect_token`, {
            method:  'POST',
            headers: {
                'X-API-KEY':    apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Pluggy /connect_token falhou [${response.status}]: ${err}`);
        }

        const data: PluggyConnectTokenResponse = await response.json();
        return data.accessToken;
    }

    private buildWidgetUrl(connectToken: string): string {
        return `https://connect.pluggy.ai?token=${connectToken}`;
    }

    // ─── Autenticação com cache ───────────────────────────────────────────────

    /**
     * Retorna um apiKey válido. O token do Pluggy expira em 2h,
     * então fazemos cache com margem de 5 minutos.
     */
    private async getApiKey(): Promise<string> {
        const margem = 5 * 60 * 1000; // 5 min em ms

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

        // apiKey do Pluggy expira em 2h (7200s)
        this.cachedApiKey = {
            apiKey:    data.apiKey,
            expiresAt: Date.now() + 2 * 60 * 60 * 1000,
        };

        this.logger.log('Pluggy: novo apiKey obtido com sucesso.');
        return data.apiKey;
    }
}