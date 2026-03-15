import { PagamentosService } from '../modules/payment/pagamento.service';
import { ResourceNotFoundException } from '../shared/exceptions/resource-not-found.exception';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { Pagamento } from '../modules/payment/entities/pagamento.entity';

const mockPagamentosRepo = {
    create:                       jest.fn(),
    findAll:                      jest.fn(),
    findById:                     jest.fn(),
    findByIdWithAttemptsInternal: jest.fn(),
};
const mockClientesRepo = { findById: jest.fn() };
const makeService      = () => new PagamentosService(mockPagamentosRepo as any, mockClientesRepo as any);

const dto = {
    clienteId:      'c1',
    nome:           'Mensalidade',
    descricao:      'Março',
    valor:          150.00,
    dataVencimento: new Date(Date.now() + 86_400_000).toISOString(),
};
const cliente = { id: 'c1', nome: 'Maria', email: 'm@test.com' };

function makePagamento(overrides = {}): Pagamento {
    const p        = new Pagamento();
    p.id           = 'pag-1';
    p.usuarioId    = 'u1';
    p.clienteId    = 'c1';
    p.nomeCliente  = 'Maria';
    p.nome         = 'Mensalidade';
    p.descricao    = 'Março';
    p.valor        = 150;
    p.valorPago    = 0;
    p.status       = StatusPagamento.AGUARDANDO_PAGAMENTO;
    p.idExterno    = null;
    p.dataVencimento = new Date(Date.now() + 86_400_000);
    p.tentativas   = [];
    p.criadoEm     = new Date();
    p.atualizadoEm = new Date();
    return Object.assign(p, overrides);
}

beforeEach(() => jest.clearAllMocks());

describe('PagamentosService', () => {
    describe('create()', () => {
        it('cria pagamento quando cliente existe', async () => {
            mockClientesRepo.findById.mockResolvedValue(cliente);
            mockPagamentosRepo.create.mockResolvedValue(makePagamento());
            const result = await makeService().create(dto as any, 'u1');
            expect(result.nome).toBe('Mensalidade');
        });

        it('lança ResourceNotFoundException quando cliente não existe', async () => {
            mockClientesRepo.findById.mockResolvedValue(null);
            await expect(makeService().create(dto as any, 'u1')).rejects.toThrow(ResourceNotFoundException);
            expect(mockPagamentosRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('findAll()', () => {
        it('retorna lista de pagamentos', async () => {
            mockPagamentosRepo.findAll.mockResolvedValue([makePagamento()]);
            expect(await makeService().findAll('u1')).toHaveLength(1);
        });

        it('usa string vazia quando nomeCliente é undefined', async () => {
            mockPagamentosRepo.findAll.mockResolvedValue([makePagamento({ nomeCliente: undefined })]);
            const result = await makeService().findAll('u1');
            expect(result[0].nomeCliente).toBe('');
        });
    });

    describe('findById()', () => {
        it('retorna pagamento quando encontrado', async () => {
            mockPagamentosRepo.findById.mockResolvedValue(makePagamento());
            expect((await makeService().findById('pag-1', 'u1')).id).toBe('pag-1');
        });

        it('lança ResourceNotFoundException quando não encontrado', async () => {
            mockPagamentosRepo.findById.mockResolvedValue(null);
            await expect(makeService().findById('x', 'u1')).rejects.toThrow(ResourceNotFoundException);
        });
    });

    describe('findByIdPublico()', () => {
        it('retorna dados públicos do pagamento', async () => {
            mockPagamentosRepo.findByIdWithAttemptsInternal.mockResolvedValue(makePagamento());
            const result = await makeService().findByIdPublico('pag-1');
            expect(result.id).toBe('pag-1');
            expect(result.nomeCliente).toBe('Maria');
            expect(result).not.toHaveProperty('usuarioId');
        });

        it('usa string vazia quando nomeCliente é undefined', async () => {
            mockPagamentosRepo.findByIdWithAttemptsInternal.mockResolvedValue(
                makePagamento({ nomeCliente: undefined }),
            );
            expect((await makeService().findByIdPublico('pag-1')).nomeCliente).toBe('');
        });

        it('lança ResourceNotFoundException quando não encontrado', async () => {
            mockPagamentosRepo.findByIdWithAttemptsInternal.mockResolvedValue(null);
            await expect(makeService().findByIdPublico('x')).rejects.toThrow(ResourceNotFoundException);
        });
    });
});