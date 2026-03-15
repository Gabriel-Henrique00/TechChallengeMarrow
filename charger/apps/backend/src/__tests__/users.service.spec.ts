import { ConflictException } from '@nestjs/common';
import { UsuariosService } from '../modules/users/users.service';
import { ResourceNotFoundException } from '../shared/exceptions/resource-not-found.exception';
import { Usuario } from '../modules/users/entities/usuario.entity';

const mockRepo = {
    findByEmail: jest.fn(),
    findByCnpj:  jest.fn(),
    create:      jest.fn(),
    findAll:     jest.fn(),
    findById:    jest.fn(),
};
const makeService = () => new UsuariosService(mockRepo as any);

const dto = {
    nome:        'Gabriel',
    email:       'gabriel@test.com',
    senha:       'Senha@123',
    nomeEmpresa: 'Charger',
    cnpj:        '11.111.111/0001-11',
};

const usuarioSalvo: { id: string; nome: string; email: string; senhaHash: string; nomeEmpresa: string; cnpj: string; criadoEm: Date } = {
    id:          'u1',
    nome:        dto.nome,
    email:       dto.email,
    senhaHash:   'hash',
    nomeEmpresa: dto.nomeEmpresa,
    cnpj:        dto.cnpj,
    criadoEm:    new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('UsuariosService', () => {
    describe('create()', () => {
        it('cria usuário quando email e CNPJ estão livres', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            mockRepo.findByCnpj.mockResolvedValue(null);
            mockRepo.create.mockResolvedValue(usuarioSalvo);

            const result = await makeService().create(dto);
            expect(result.email).toBe(dto.email);
            expect(mockRepo.create).toHaveBeenCalled();
        });

        it('lança ConflictException quando email já existe', async () => {
            mockRepo.findByEmail.mockResolvedValue(usuarioSalvo);
            await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it('lança ConflictException quando CNPJ já existe', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            mockRepo.findByCnpj.mockResolvedValue(usuarioSalvo);
            await expect(makeService().create(dto)).rejects.toThrow(ConflictException);
            expect(mockRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll()', () => {
        it('retorna lista mapeada de usuários', async () => {
            mockRepo.findAll.mockResolvedValue([usuarioSalvo]);
            const result = await makeService().findAll();
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe(dto.email);
        });

        it('retorna lista vazia quando não há usuários', async () => {
            mockRepo.findAll.mockResolvedValue([]);
            expect(await makeService().findAll()).toEqual([]);
        });
    });

    describe('findById()', () => {
        it('retorna usuário quando encontrado', async () => {
            mockRepo.findById.mockResolvedValue(usuarioSalvo);
            const result = await makeService().findById('u1');
            expect(result.id).toBe('u1');
        });

        it('lança ResourceNotFoundException quando não encontrado', async () => {
            mockRepo.findById.mockResolvedValue(null);
            await expect(makeService().findById('x')).rejects.toThrow(ResourceNotFoundException);
        });
    });

    describe('findByEmailComSenha()', () => {
        it('retorna o usuário com senha quando encontrado', async () => {
            mockRepo.findByEmail.mockResolvedValue(usuarioSalvo);
            expect(await makeService().findByEmailComSenha(dto.email)).toBe(usuarioSalvo);
        });

        it('retorna null quando não encontrado', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            expect(await makeService().findByEmailComSenha('x@x.com')).toBeNull();
        });
    });
});