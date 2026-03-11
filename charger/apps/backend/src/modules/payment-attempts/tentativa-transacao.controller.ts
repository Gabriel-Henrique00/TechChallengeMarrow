import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { TentativasTransacaoService } from './tentativa-transacao.service';
import { CriarTentativaDto } from './dto/create-tentativa.dto';

@Controller('payments')
export class TentativasTransacaoController {
    constructor(private readonly tentativasService: TentativasTransacaoService) {}

    @Post(':id/attempt')
    criar(@Param('id') pagamentoId: string, @Body() dto: CriarTentativaDto) {
        return this.tentativasService.create(pagamentoId, dto);
    }

    @Get(':id/attempts')
    buscarPorPagamentoId(@Param('id') pagamentoId: string) {
        return this.tentativasService.findByPaymentId(pagamentoId);
    }
}