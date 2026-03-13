import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthRespostaDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDto): Promise<AuthRespostaDto> {
        const usuario = await this.usuariosService.findByEmailComSenha(dto.email);

        if (!usuario) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
        if (!senhaValida) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const payload     = { sub: usuario.id, email: usuario.email };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            usuario: {
                id:          usuario.id,
                nome:        usuario.nome,
                email:       usuario.email,
                nomeEmpresa: usuario.nomeEmpresa,
            },
        };
    }
}