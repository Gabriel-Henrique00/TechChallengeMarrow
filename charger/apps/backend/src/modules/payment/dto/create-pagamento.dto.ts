import { IsString, IsNumber, IsUUID, IsDateString, IsOptional, Min } from 'class-validator';

export class CriarPagamentoDto {
    @IsUUID()
    clienteId: string;

    @IsString()
    nome: string;

    @IsString()
    @IsOptional()
    descricao?: string;

    @IsNumber()
    @Min(0.01)
    valor: number;

    @IsDateString()
    dataVencimento: string;
}