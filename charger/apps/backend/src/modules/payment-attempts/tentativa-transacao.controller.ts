import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { CriarTentativaDto } from './dto/create-tentativa.dto';

@ApiTags('payments')
@Controller('payments')
export class TentativasTransacaoController {
    constructor(private readonly tentativasService: TentativasTransacaoService) {}

    @Post(':id/attempt')
    @ApiOperation({ summary: 'Registrar uma nova tentativa de transação para um pagamento' })
    @ApiParam({ name: 'id', description: 'Identificador único do pagamento (UUID) alvo da tentativa', type: String })
    @ApiResponse({ status: 201, description: 'Tentativa de transação registrada com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos para a tentativa de transação.' })
    @ApiResponse({ status: 404, description: 'Pagamento referenciado não encontrado.' })
    criar(@Param('id') pagamentoId: string, @Body() dto: CriarTentativaDto) {
        return this.tentativasService.create(pagamentoId, dto);
    }

    @Get(':id/attempts')
    @ApiOperation({ summary: 'Listar todas as tentativas de transação vinculadas a um pagamento' })
    @ApiParam({ name: 'id', description: 'Identificador único do pagamento (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Histórico de tentativas retornado com sucesso.' })
    buscarPorPagamentoId(@Param('id') pagamentoId: string) {
        return this.tentativasService.findByPaymentId(pagamentoId);
    }
}