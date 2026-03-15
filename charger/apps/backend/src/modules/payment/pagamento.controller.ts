import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PagamentosService } from './pagamento.service';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('payments')
@Controller('payments')
export class PagamentoController {
    constructor(private readonly pagamentosService: PagamentosService) {}

    @Get('public/:id')
    @ApiOperation({ summary: 'Buscar dados públicos de um pagamento (sem autenticação)' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento' })
    @ApiResponse({ status: 200, description: 'Dados retornados com sucesso.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    buscarPublico(@Param('id') id: string) {
        return this.pagamentosService.findByIdPublico(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Criar uma nova cobrança para um cliente' })
    @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    criar(
        @Body() dto: CriarPagamentoDto,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.pagamentosService.create(dto, usuario.id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos os pagamentos do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarTodos(@UsuarioAtual() usuario: { id: string }) {
        return this.pagamentosService.findAll(usuario.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Buscar detalhes de um pagamento pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento' })
    @ApiResponse({ status: 200, description: 'Dados retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    buscarPorId(
        @Param('id') id: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.pagamentosService.findById(id, usuario.id);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancelar um pagamento' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento' })
    @ApiResponse({ status: 200, description: 'Pagamento cancelado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Pagamento não pode ser cancelado (já pago, vencido ou já cancelado).' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    cancelar(
        @Param('id') id: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.pagamentosService.cancel(id, usuario.id);
    }
}