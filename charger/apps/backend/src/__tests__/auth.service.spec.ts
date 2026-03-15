import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../modules/auth/auth.service';
import * as bcrypt from 'bcryptjs';

const mockUsuariosService = { findByEmailComSenha: jest.fn() };
const mockJwtService      = { sign: jest.fn().mockReturnValue('token-jwt') };
const makeService         = () => new AuthService(mockUsuariosService as any, mockJwtService as any);

const usuario = {
    id:          'u1',
    nome:        'João',
    email:       'joao@test.com',
    senhaHash:   bcrypt.hashSync('senha123', 10),
    nomeEmpresa: 'Empresa X',
};

beforeEach(() => jest.clearAllMocks());

describe('AuthService', () => {
    describe('login()', () => {
        it('retorna accessToken e dados do usuário com credenciais válidas', async () => {
            mockUsuariosService.findByEmailComSenha.mockResolvedValue(usuario);
            const result = await makeService().login({ email: usuario.email, senha: 'senha123' });

            expect(result.accessToken).toBe('token-jwt');
            expect(result.usuario.email).toBe(usuario.email);
            expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: usuario.id, email: usuario.email });
        });

        it('lança UnauthorizedException quando usuário não existe', async () => {
            mockUsuariosService.findByEmailComSenha.mockResolvedValue(null);
            await expect(makeService().login({ email: 'x@x.com', senha: '123' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('lança UnauthorizedException quando senha é inválida', async () => {
            mockUsuariosService.findByEmailComSenha.mockResolvedValue(usuario);
            await expect(makeService().login({ email: usuario.email, senha: 'errada' }))
                .rejects.toThrow(UnauthorizedException);
        });
    });
});