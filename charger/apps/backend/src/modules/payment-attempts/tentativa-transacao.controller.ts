import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { CriarTentativaDto } from './dto/create-tentativa.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class TentativasTransacaoController {
    constructor(private readonly tentativasService: TentativasTransacaoService) {}

    @Post(':id/attempt')
    @ApiOperation({ summary: 'Registrar uma nova tentativa de transação para um pagamento' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento', type: String })
    @ApiResponse({ status: 201, description: 'Tentativa registrada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    criar(
        @Param('id') pagamentoId: string,
        @Body() dto: CriarTentativaDto,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.tentativasService.create(pagamentoId, dto, usuario.id);
    }

    @Get(':id/attempts')
    @ApiOperation({ summary: 'Listar todas as tentativas de um pagamento' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento', type: String })
    @ApiResponse({ status: 200, description: 'Histórico de tentativas retornado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarPorPagamentoId(
        @Param('id') pagamentoId: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.tentativasService.findByPaymentId(pagamentoId, usuario.id);
    }
}