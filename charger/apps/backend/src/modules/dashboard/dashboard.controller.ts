import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('summary')
    @ApiOperation({ summary: 'Resumo financeiro do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Resumo retornado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarResumo(@UsuarioAtual() usuario: { id: string }) {
        return this.dashboardService.buscarResumo(usuario.id);
    }
}