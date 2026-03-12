import { IsString, IsNumber, IsUUID, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CriarPagamentoDto {
    @ApiProperty({
        description: 'ID único do cliente ao qual este pagamento pertence (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    clienteId: string;

    @ApiProperty({
        description: 'Nome ou título de identificação do pagamento',
        example: 'Mensalidade Plano Premium',
    })
    @IsString()
    nome: string;

    @ApiPropertyOptional({
        description: 'Descrição detalhada do pagamento',
        example: 'Pagamento referente à assinatura do mês de março.',
    })
    @IsString()
    @IsOptional()
    descricao?: string;

    @ApiProperty({
        description: 'Valor monetário do pagamento',
        example: 150.50,
        minimum: 0.01,
    })
    @IsNumber()
    @Min(0.01)
    valor: number;

    @ApiProperty({
        description: 'Data de vencimento do pagamento no formato ISO 8601',
        example: '2026-04-15T00:00:00.000Z',
    })
    @IsDateString()
    dataVencimento: string;
}