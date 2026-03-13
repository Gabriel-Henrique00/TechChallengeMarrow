import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentoController } from './pagamento.controller';
import { PagamentosService } from './pagamento.service';
import { PagamentosTypeOrmRepository } from './repositories/pagamento.typeorm.repository';
import { PagamentoModelo } from './models/pagamento.model';
import { ClientesModule } from '../clients/clientes.module';
import { TentativasTransacaoModule } from '../payment-attempts/tentativa-transacao.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PagamentoModelo]),
        ClientesModule,
        forwardRef(() => TentativasTransacaoModule),
    ],
    controllers: [PagamentoController],
    providers: [
        PagamentosService,
        {
            provide:  'IPagamentosRepository',
            useClass: PagamentosTypeOrmRepository,
        },
    ],
    exports: ['IPagamentosRepository', PagamentosService],
})
export class PagamentosModule {}