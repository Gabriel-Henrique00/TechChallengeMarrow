import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PagamentosService } from './pagamento.service';
import { CriarPagamentoDto } from './dto/create-pagamento.dto';

@Controller('payments')
export class PagamentoController {
    constructor(private readonly pagamentosService: PagamentosService) {}

    @Post()
    criar(@Body() dto: CriarPagamentoDto) {
        return this.pagamentosService.create(dto);
    }

    @Get()
    buscarTodos() {
        return this.pagamentosService.findAll();
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.pagamentosService.findById(id);
    }
}