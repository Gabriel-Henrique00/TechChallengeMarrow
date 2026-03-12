import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PagamentosModule } from '../payment/pagamento.module';

@Module({
    imports: [PagamentosModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}