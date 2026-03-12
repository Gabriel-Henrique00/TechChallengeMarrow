import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/create-cliente.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados de validação inválidos fornecidos no payload.' })
    criar(@Body() dto: CriarClienteDto) {
        return this.clientesService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os clientes cadastrados' })
    @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
    buscarTodos() {
        return this.clientesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um cliente específico pelo ID' })
    @ApiParam({ name: 'id', description: 'Identificador único do cliente (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Dados do cliente retornados com sucesso.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado com o ID fornecido.' })
    buscarPorId(@Param('id') id: string) {
        return this.clientesService.findById(id);
    }
}