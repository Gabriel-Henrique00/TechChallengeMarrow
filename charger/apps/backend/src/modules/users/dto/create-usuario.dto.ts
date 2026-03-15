import {
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
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
    @MinLength(2,   { message: 'O nome deve ter no mínimo 2 caracteres.' })
    @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
    nome: string;

    @ApiProperty({ example: 'joao.silva@charger.com' })
    @IsEmail({}, { message: 'Informe um e-mail válido.' })
    @MaxLength(200, { message: 'O e-mail deve ter no máximo 200 caracteres.' })
    email: string;

    @ApiProperty({ example: 'Senha@123', minLength: 8 })
    @IsString()
    @MinLength(8,  { message: 'A senha deve ter no mínimo 8 caracteres.' })
    @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' }) // limite do bcrypt
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número.',
    })
    senha: string;

    @ApiProperty({ example: 'Empresa Exemplo Ltda' })
    @IsString()
    @MinLength(2,   { message: 'O nome da empresa deve ter no mínimo 2 caracteres.' })
    @MaxLength(200, { message: 'O nome da empresa deve ter no máximo 200 caracteres.' })
    nomeEmpresa: string;

    @ApiProperty({ example: '11222333000181' })
    @Transform(({ value }) => value?.replaceAll(/\D/g, ''))
    @IsString()
    @Validate(IsCnpjConstraint)
    cnpj: string;
}