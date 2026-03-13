import { ApiProperty } from '@nestjs/swagger';

export class AuthRespostaDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    usuario: {
        id: string;
        nome: string;
        email: string;
        nomeEmpresa: string;
    };
}