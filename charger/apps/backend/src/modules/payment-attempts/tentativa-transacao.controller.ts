import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class TentativasTransacaoController {
    constructor(private readonly tentativasService: TentativasTransacaoService) {}

    @Post(':id/attempt')
    @ApiOperation({ summary: 'Registrar uma nova tentativa de pagamento via Pluggy' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento', type: String })
    @ApiResponse({ status: 201, description: 'Tentativa registrada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Pagamento vencido, já pago ou tentativa em andamento.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    criar(
        @Param('id') pagamentoId: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.tentativasService.create(pagamentoId, usuario.id);
    }

    @Get(':id/attempts')
    @ApiOperation({ summary: 'Listar todas as tentativas de um pagamento' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento', type: String })
    @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarPorPagamentoId(
        @Param('id') pagamentoId: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.tentativasService.findByPaymentId(pagamentoId, usuario.id);
    }
}