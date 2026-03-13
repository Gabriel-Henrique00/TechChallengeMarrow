import {
    Controller,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly webhooksService: WebhooksService,
        private readonly configService:   ConfigService,
    ) {}

    @Post('pluggy')
    @HttpCode(HttpStatus.OK)
    async receberEventoPluggy(
        @Body()                       payload:   Record<string, any>,
        @Headers('pluggy-signature')  signature: string | undefined,
    ) {
        this.validarAssinatura(payload, signature);
        this.logger.log(`Webhook Pluggy recebido: event=${payload.event}`);
        await this.webhooksService.processarPluggy(payload);
        return { received: true };
    }

    private validarAssinatura(payload: Record<string, any>, signature: string | undefined): void {
        const secret = this.configService.get<string>('pluggy.webhookSecret');

        if (!secret) {
            this.logger.warn('PLUGGY_WEBHOOK_SECRET não configurado — assinatura não validada.');
            return;
        }

        if (!signature) {
            throw new UnauthorizedException('Assinatura do webhook ausente.');
        }

        const expected = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        const assinaturaRecebida = signature.startsWith('sha256=')
            ? signature.slice(7)
            : signature;

        const match = crypto.timingSafeEqual(
            Buffer.from(expected),
            Buffer.from(assinaturaRecebida),
        );

        if (!match) {
            throw new UnauthorizedException('Assinatura do webhook inválida.');
        }
    }
}