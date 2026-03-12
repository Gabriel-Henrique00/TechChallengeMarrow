import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarTentativaDto {
    @ApiProperty({
        description: 'Código ou identificador do banco/instituição financeira',
        example: '033',
    })
    @IsString()
    idBanco: string;

    @ApiProperty({
        description: 'Nome da instituição financeira processando a tentativa',
        example: 'Banco Santander',
    })
    @IsString()
    nomeBanco: string;
}