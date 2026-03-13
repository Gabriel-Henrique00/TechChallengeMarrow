import { ApiProperty } from '@nestjs/swagger';

export class UsuarioRespostaDto {
    @ApiProperty({ example: 'uuid-aqui' })
    id: string;

    @ApiProperty({ example: 'João da Silva' })
    nome: string;

    @ApiProperty({ example: 'joao.silva@charger.com' })
    email: string;

    @ApiProperty({ example: 'Empresa Exemplo Ltda' })
    nomeEmpresa: string;

    @ApiProperty({ example: '11222333000181' })
    cnpj: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    criadoEm: string;
}