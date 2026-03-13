import {
    IsString,
    IsEmail,
    MinLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { cnpj } from 'cpf-cnpj-validator';

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
    validate(value: string, _args: ValidationArguments) {
        if (!value) return false;
        return cnpj.isValid(value);
    }

    defaultMessage(_args: ValidationArguments) {
        return 'O CNPJ informado não é válido.';
    }
}

export class CriarUsuarioDto {
    @ApiProperty({ example: 'João da Silva' })
    @IsString()
    nome: string;

    @ApiProperty({ example: 'joao.silva@charger.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'senha123', minLength: 6 })
    @IsString()
    @MinLength(6)
    senha: string;

    @ApiProperty({ example: 'Empresa Exemplo Ltda' })
    @IsString()
    nomeEmpresa: string;

    @ApiProperty({
        description: 'CNPJ da empresa (apenas números ou formatado)',
        example: '11222333000181',
    })
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    @IsString()
    @Validate(IsCnpjConstraint)
    cnpj: string;
}