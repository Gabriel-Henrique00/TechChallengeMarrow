import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('payments')
@Controller('payments')
export class TentativasTransacaoController {
    constructor(private readonly tentativasService: TentativasTransacaoService) {}

    @Post(':id/attempt')
    @ApiOperation({ summary: 'Iniciar tentativa de pagamento via Pluggy (público)' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento' })
    @ApiResponse({ status: 201, description: 'Tentativa registrada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Pagamento vencido, já pago ou tentativa em andamento.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    criar(@Param('id') pagamentoId: string) {
        return this.tentativasService.createPublico(pagamentoId);
    }

    @Get(':id/attempts')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar tentativas de um pagamento (autenticado)' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento' })
    @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarPorPagamentoId(
        @Param('id') pagamentoId: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.tentativasService.findByPaymentId(pagamentoId, usuario.id);
    }
}