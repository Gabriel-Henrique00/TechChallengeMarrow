import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../users/users.module';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';

@Module({
    imports: [
        UsuariosModule,
        JwtModule.registerAsync({
            imports:    [ConfigModule],
            inject:     [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret:      config.getOrThrow<string>('jwt.secret'),
                signOptions: { expiresIn: config.getOrThrow<string>('jwt.expiresIn') as any },
            }),
        }),
    ],
    controllers: [AuthController],
    providers:   [AuthService, JwtStrategy],
    exports:     [JwtModule],
})
export class AuthModule {}