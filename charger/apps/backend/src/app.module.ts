import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import envConfig from './config/env.config';
import { typeOrmConfig } from './shared/database/typeorm.config';
import { ClientesModule } from './modules/clients/clientes.module';
import { PagamentosModule } from './modules/payment/pagamento.module';
import { TentativasTransacaoModule } from './modules/payment-attempts/tentativa-transacao.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { UsuariosModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    ClientesModule,
    PagamentosModule,
    TentativasTransacaoModule,
    DashboardModule,
    WebhooksModule,
    UsuariosModule,
    AuthModule,
  ],
})
export class AppModule {}