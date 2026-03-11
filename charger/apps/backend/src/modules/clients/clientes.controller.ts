import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CriarClienteDto } from './dto/create-cliente.dto';

@Controller('clients')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) {}

    @Post()
    criar(@Body() dto: CriarClienteDto) {
        return this.clientesService.create(dto);
    }

    @Get()
    buscarTodos() {
        return this.clientesService.findAll();
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.clientesService.findById(id);
    }
}