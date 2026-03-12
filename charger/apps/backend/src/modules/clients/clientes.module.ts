import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClientesTypeOrmRepository } from './repositories/clients.typeorm.repository';
import { ClienteModelo } from './models/cliente.model';

@Module({
    imports: [TypeOrmModule.forFeature([ClienteModelo])],
    controllers: [ClientesController],
    providers: [
        ClientesService,
        {
            provide:  'IClientesRepository',
            useClass: ClientesTypeOrmRepository,
        },
    ],
    exports: ['IClientesRepository'],
})
export class ClientesModule {}