import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TentativasTransacaoController } from './tentativa-transacao.controller';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { TentativasTransacaoTypeOrmRepository } from './repositories/tentativa-transacao.typeorm.repository';
import { TentativaTransacaoModelo } from './models/tentativa-transacao.model';
import { PagamentosModule } from '../payment/pagamento.module';
import { PluggyPaymentAdapter } from '../../integrations/payment-provider/pluggy.payment.adapter';

@Module({
    imports: [
        TypeOrmModule.forFeature([TentativaTransacaoModelo]),
        forwardRef(() => PagamentosModule),
    ],
    controllers: [TentativasTransacaoController],
    providers: [
        TentativasTransacaoService,
        {
            provide:  'ITentativasTransacaoRepository',
            useClass: TentativasTransacaoTypeOrmRepository,
        },
        {
            provide:  'IPaymentProvider',
            useClass: PluggyPaymentAdapter,
        },
    ],
    exports: [
        'ITentativasTransacaoRepository',
        'IPaymentProvider',
        TentativasTransacaoService,
    ],
})
export class TentativasTransacaoModule {}