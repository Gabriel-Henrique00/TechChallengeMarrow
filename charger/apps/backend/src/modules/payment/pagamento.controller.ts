import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PagamentosService } from './pagamento.service';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';
import { TentativasTransacaoService } from '../payment-attempts/tentativa-transacao.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PagamentoController {
    constructor(
        private readonly pagamentosService:   PagamentosService,
        private readonly tentativasService:   TentativasTransacaoService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Criar uma nova cobrança para um cliente' })
    @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    criar(
        @Body() dto: CriarPagamentoDto,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.pagamentosService.create(dto, usuario.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os pagamentos do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarTodos(@UsuarioAtual() usuario: { id: string }) {
        return this.pagamentosService.findAll(usuario.id);
    }

    @Get('banks')
    @ApiOperation({ summary: 'Listar bancos disponíveis para pagamento' })
    @ApiResponse({ status: 200, description: 'Lista de bancos retornada com sucesso.' })
    listarBancos() {
        return this.tentativasService.getAvailableBanks();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar detalhes de um pagamento pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do pagamento', type: String })
    @ApiResponse({ status: 200, description: 'Dados do pagamento retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    buscarPorId(
        @Param('id') id: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.pagamentosService.findById(id, usuario.id);
    }
}