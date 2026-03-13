import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'joao.silva@charger.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'senha123' })
    @IsString()
    senha: string;
}