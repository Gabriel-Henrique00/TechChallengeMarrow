import { IsString } from 'class-validator';

export class CriarTentativaDto {
    @IsString()
    idBanco: string;

    @IsString()
    nomeBanco: string;
}