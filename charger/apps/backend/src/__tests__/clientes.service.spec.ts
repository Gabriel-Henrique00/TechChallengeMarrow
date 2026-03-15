import { ConflictException } from '@nestjs/common';
import { ClientesService } from '../modules/clients/clientes.service';
import { ResourceNotFoundException } from '../shared/exceptions/resource-not-found.exception';

const mockRepo = {
    findByEmail:     jest.fn(),
    findByDocumento: jest.fn(),
    create:          jest.fn(),
    findAll:         jest.fn(),
    findById:        jest.fn(),
};
const makeService = () => new ClientesService(mockRepo as any);

const dto = { nome: 'Maria', email: 'maria@test.com', documento: '111.111.111-11', telefone: '11999999999' };

const clienteSalvo = {
    id: 'c1', usuarioId: 'u1', nome: dto.nome, email: dto.email,
    documento: dto.documento, telefone: dto.telefone, criadoEm: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('ClientesService', () => {
    describe('create()', () => {
        it('cria cliente quando email e documento estão livres', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            mockRepo.findByDocumento.mockResolvedValue(null);
            mockRepo.create.mockResolvedValue(clienteSalvo);
            const result = await makeService().create(dto as any, 'u1');
            expect(result.email).toBe(dto.email);
        });

        it('lança ConflictException quando email já existe', async () => {
            mockRepo.findByEmail.mockResolvedValue(clienteSalvo);
            await expect(makeService().create(dto as any, 'u1')).rejects.toThrow(ConflictException);
            expect(mockRepo.create).not.toHaveBeenCalled();
        });

        it('lança ConflictException quando documento já existe', async () => {
            mockRepo.findByEmail.mockResolvedValue(null);
            mockRepo.findByDocumento.mockResolvedValue(clienteSalvo);
            await expect(makeService().create(dto as any, 'u1')).rejects.toThrow(ConflictException);
            expect(mockRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll()', () => {
        it('retorna lista de clientes do usuário', async () => {
            mockRepo.findAll.mockResolvedValue([clienteSalvo]);
            expect(await makeService().findAll('u1')).toHaveLength(1);
        });

        it('retorna lista vazia', async () => {
            mockRepo.findAll.mockResolvedValue([]);
            expect(await makeService().findAll('u1')).toEqual([]);
        });
    });

    describe('findById()', () => {
        it('retorna cliente quando encontrado', async () => {
            mockRepo.findById.mockResolvedValue(clienteSalvo);
            expect((await makeService().findById('c1', 'u1')).id).toBe('c1');
        });

        it('lança ResourceNotFoundException quando não encontrado', async () => {
            mockRepo.findById.mockResolvedValue(null);
            await expect(makeService().findById('x', 'u1')).rejects.toThrow(ResourceNotFoundException);
        });
    });
});