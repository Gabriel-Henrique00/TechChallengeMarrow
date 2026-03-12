import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) {}

    @Post('payment-provider')
    receberEvento(
        @Body() payload: Record<string, any>,
    ) {
        return this.webhooksService.processar(payload, '');
    }
}