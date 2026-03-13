import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './users.service';
import { CriarUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo usuário do sistema' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
    @ApiResponse({ status: 409, description: 'E-mail ou CNPJ já está em uso.' })
    criar(@Body() dto: CriarUsuarioDto) {
        return this.usuariosService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos os usuários' })
    @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    buscarTodos() {
        return this.usuariosService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do usuário', type: String })
    @ApiResponse({ status: 200, description: 'Dados do usuário retornados com sucesso.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    buscarPorId(@Param('id') id: string) {
        return this.usuariosService.findById(id);
    }
}