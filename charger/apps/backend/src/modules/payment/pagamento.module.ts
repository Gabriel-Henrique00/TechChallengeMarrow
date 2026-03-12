import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentoController } from './pagamento.controller';
import { PagamentosService } from './pagamento.service';
import { PagamentosTypeOrmRepository } from './repositories/pagamento.typeorm.repository';
import { PagamentoModelo } from './models/pagamento.model';
import { ClientesModule } from '../clients/clientes.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PagamentoModelo]),
        ClientesModule,
    ],
    controllers: [PagamentoController],
    providers: [
        PagamentosService,
        {
            provide:  'IPagamentosRepository',
            useClass: PagamentosTypeOrmRepository,
        },
    ],
    exports: ['IPagamentosRepository'],
})
export class PagamentosModule {}