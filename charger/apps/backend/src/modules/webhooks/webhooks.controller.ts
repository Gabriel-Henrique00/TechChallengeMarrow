import {
    Controller,
    Get,
    Post,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly webhooksService: WebhooksService,
        private readonly configService:   ConfigService,
    ) {}

    // Endpoint de health check para validação do Pluggy
    @Get('pluggy')
    @HttpCode(HttpStatus.OK)
    health() {
        return { ok: true };
    }

    @Post('pluggy')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Receber evento de webhook do Pluggy' })
    @ApiBody({
        schema: {
            example: {
                event: 'payment_intent/completed',
                data:  { paymentRequestId: 'uuid-do-payment-request' },
            },
        },
    })
    async receberEventoPluggy(
        @Body()                       payload:   Record<string, any>,
        @Headers('x-webhook-secret')  signature: string | undefined,
    ) {
        this.validarAssinatura(payload, signature);
        this.logger.log(`Webhook Pluggy recebido: event=${payload.event}`);
        await this.webhooksService.processarPluggy(payload);
        return { received: true };
    }

    private validarAssinatura(payload: Record<string, any>, signature: string | undefined): void {
        const secret = this.configService.get<string>('pluggy.webhookSecret');
        if (!secret) {
            this.logger.warn('PLUGGY_WEBHOOK_SECRET não configurado — validação pulada.');
            return;
        }
        if (signature !== secret) {
            throw new UnauthorizedException('Assinatura do webhook inválida.');
        }
    }
}