import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PagamentosService } from './pagamento.service';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';

@ApiTags('payments')
@Controller('payments')
export class PagamentoController {
    constructor(private readonly pagamentosService: PagamentosService) {}

    @Post()
    @ApiOperation({ summary: 'Criar uma nova cobrança/pagamento para um cliente' })
    @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos no payload de criação.' })
    criar(@Body() dto: CriarPagamentoDto) {
        return this.pagamentosService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os pagamentos cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso.' })
    buscarTodos() {
        return this.pagamentosService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar detalhes de um pagamento específico pelo ID' })
    @ApiParam({ name: 'id', description: 'Identificador único do pagamento (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Dados do pagamento retornados com sucesso.' })
    @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
    buscarPorId(@Param('id') id: string) {
        return this.pagamentosService.findById(id);
    }
}