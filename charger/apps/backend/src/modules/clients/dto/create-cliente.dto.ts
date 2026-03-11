import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CriarClienteDto {
    @IsString()
    nome: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    telefone?: string;

    @IsString()
    @Length(11, 14)
    documento: string;
}