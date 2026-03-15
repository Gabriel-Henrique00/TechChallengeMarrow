import {
    IsString,
    IsNumber,
    IsUUID,
    IsDateString,
    IsOptional,
    Min,
    Max,
    MinLength,
    MaxLength,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'hasTimezone', async: false })
export class HasTimezoneConstraint implements ValidatorConstraintInterface {
    private readonly TIMEZONE_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

    validate(value: string, _args: ValidationArguments): boolean {
        return this.TIMEZONE_PATTERN.test(value);
    }

    defaultMessage(_args: ValidationArguments): string {
        return (
            'A data de vencimento deve incluir o offset de fuso horário ' +
            '(ex.: "2026-04-15T00:00:00-03:00" ou "2026-04-15T03:00:00Z").'
        );
    }
}

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: string, _args: ValidationArguments): boolean {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date > new Date();
    }

    defaultMessage(_args: ValidationArguments): string {
        return 'A data de vencimento deve ser uma data futura.';
    }
}

export class CriarPagamentoDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    clienteId: string;

    @ApiProperty({ example: 'Mensalidade Plano Premium' })
    @IsString()
    @MinLength(3,  { message: 'O nome deve ter no mínimo 3 caracteres.' })
    @MaxLength(200, { message: 'O nome deve ter no máximo 200 caracteres.' })
    nome: string;

    @ApiPropertyOptional({ example: 'Pagamento referente ao mês de março.' })
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres.' })
    descricao?: string;

    @ApiProperty({ example: 150.50, minimum: 0.01, maximum: 999999.99 })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor deve ser um número com no máximo 2 casas decimais.' })
    @Min(0.01,      { message: 'O valor mínimo é R$ 0,01.' })
    @Max(999999.99, { message: 'O valor máximo é R$ 999.999,99.' })
    valor: number;

    @ApiProperty({
        example: '2026-04-15T00:00:00-03:00',
        description:
            'Data de vencimento em ISO 8601 com offset de timezone obrigatório. ' +
            'Ex.: "2026-04-15T00:00:00-03:00" (Brasília) ou "2026-04-15T03:00:00Z" (UTC equivalente).',
    })
    @IsDateString()
    @Validate(HasTimezoneConstraint)
    @Validate(IsFutureDateConstraint)
    dataVencimento: string;
}