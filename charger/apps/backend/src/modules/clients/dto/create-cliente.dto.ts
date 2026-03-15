import {
    IsString,
    IsEmail,
    IsOptional,
    Length,
    MinLength,
    MaxLength,
    Matches,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { cpf, cnpj } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'isCpfOrCnpj', async: false })
export class IsCpfOrCnpjConstraint implements ValidatorConstraintInterface {
    validate(documento: string, _args: ValidationArguments) {
        if (!documento) return false;
        return cpf.isValid(documento) || cnpj.isValid(documento);
    }
    defaultMessage(_args: ValidationArguments) {
        return 'O documento informado não é um CPF ou CNPJ válido.';
    }
}

export class CriarClienteDto {
    @ApiProperty({ example: 'João da Silva' })
    @IsString()
    @MinLength(2,   { message: 'O nome deve ter no mínimo 2 caracteres.' })
    @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
    nome: string;

    @ApiProperty({ example: 'joao.silva@email.com' })
    @IsEmail({}, { message: 'Informe um e-mail válido.' })
    @MaxLength(200, { message: 'O e-mail deve ter no máximo 200 caracteres.' })
    email: string;

    @ApiPropertyOptional({ example: '11999999999' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    @Matches(/^\d{10,11}$/, { message: 'O telefone deve ter 10 ou 11 dígitos.' })
    telefone?: string;

    @ApiProperty({ example: '12345678901' })
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    @IsString()
    @Length(11, 14, { message: 'O documento deve ter entre 11 e 14 dígitos.' })
    @Validate(IsCpfOrCnpjConstraint)
    documento: string;
}