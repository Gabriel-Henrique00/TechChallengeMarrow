import { IsString, IsEmail, IsOptional, Length, Validate,ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
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
    @ApiProperty({
        description: 'O nome completo do cliente',
        example: 'João da Silva',
    })
    @IsString()
    nome: string;

    @ApiProperty({
        description: 'O endereço de e-mail do cliente para contato e cobranças',
        example: 'joao.silva@email.com',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        description: 'O telefone de contato do cliente com DDD',
        example: '11999999999',
    })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    telefone?: string;

    @ApiProperty({
        description: 'Documento de identificação do cliente (CPF ou CNPJ)',
        example: '12345678901',
        minLength: 11,
        maxLength: 14,
    })
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    @IsString()
    @Length(11, 14)
    @Validate(IsCpfOrCnpjConstraint)
    documento: string;
}