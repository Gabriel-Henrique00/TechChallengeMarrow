import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PagamentosModule } from '../payment/pagamento.module';
import { TentativasTransacaoModule } from '../payment-attempts/tentativa-transacao.module';

@Module({
    imports: [
        PagamentosModule,
        TentativasTransacaoModule,
    ],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule {}