import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
        description: 'O telefone de contato do cliente com DDD (apenas números)',
        example: '11999999999',
    })
    @IsString()
    @IsOptional()
    telefone?: string;

    @ApiProperty({
        description: 'Documento de identificação do cliente (CPF ou CNPJ) sem pontuação',
        example: '12345678901',
        minLength: 11,
        maxLength: 14,
    })
    @IsString()
    @Length(11, 14)
    documento: string;
}