import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TentativasTransacaoController } from './tentativa-transacao.controller';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { TentativasTransacaoTypeOrmRepository } from './repositories/tentativa-transacao.typeorm.repository';
import { TentativaTransacaoModelo } from './models/tentativa-transacao.model';
import { PagamentosModule } from '../payment/pagamento.module';
import { FakePaymentAdapter } from '../../integrations/payment-provider/fake.pagamento.adapter';

@Module({
    imports: [
        TypeOrmModule.forFeature([TentativaTransacaoModelo]),
        PagamentosModule,
    ],
    controllers: [TentativasTransacaoController],
    providers: [
        TentativasTransacaoService,
        {
            provide: 'ITentativasTransacaoRepository',
            useClass: TentativasTransacaoTypeOrmRepository,
        },
        {
            provide: 'IPaymentProvider',
            useClass: FakePaymentAdapter,
        },
    ],
    exports: [
        'ITentativasTransacaoRepository',
        'IPaymentProvider'
    ],
})
export class TentativasTransacaoModule {}