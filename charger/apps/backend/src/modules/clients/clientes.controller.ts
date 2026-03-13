import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/create-cliente.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsuarioAtual } from '../../shared/decorators/usuario-atual.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo cliente' })
    @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    criar(
        @Body() dto: CriarClienteDto,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.clientesService.create(dto, usuario.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os clientes do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Lista de clientes retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarTodos(@UsuarioAtual() usuario: { id: string }) {
        return this.clientesService.findAll(usuario.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um cliente específico pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do cliente', type: String })
    @ApiResponse({ status: 200, description: 'Dados do cliente retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado.' })
    buscarPorId(
        @Param('id') id: string,
        @UsuarioAtual() usuario: { id: string },
    ) {
        return this.clientesService.findById(id, usuario.id);
    }
}