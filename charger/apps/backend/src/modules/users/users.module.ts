import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './users.controller';
import { UsuariosService } from './users.service';
import { UsuariosTypeOrmRepository } from './repositories/usuarios.typeorm.repository';
import { UsuarioModelo } from './models/usuario.model';

@Module({
    imports: [TypeOrmModule.forFeature([UsuarioModelo])],
    controllers: [UsuariosController],
    providers: [
        UsuariosService,
        {
            provide:  'IUsuariosRepository',
            useClass: UsuariosTypeOrmRepository,
        },
    ],
    exports: [UsuariosService],
})
export class UsuariosModule {}