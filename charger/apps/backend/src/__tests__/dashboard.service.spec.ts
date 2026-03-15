import { DashboardService } from '../modules/dashboard/dashboard.service';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { Pagamento } from '../modules/payment/entities/pagamento.entity';

const mockRepo    = { findAll: jest.fn() };
const makeService = () => new DashboardService(mockRepo as any);

function makePag(status: StatusPagamento, valor: number, valorPago = 0): Partial<Pagamento> {
    return {
        id: 'p' + Math.random(), nome: 'Pag', nomeCliente: 'Cliente',
        status, valor, valorPago, criadoEm: new Date(),
    };
}

beforeEach(() => jest.clearAllMocks());

describe('DashboardService', () => {
    describe('buscarResumo()', () => {
        it('retorna zeros quando não há pagamentos', async () => {
            mockRepo.findAll.mockResolvedValue([]);
            const r = await makeService().buscarResumo('u1');
            expect(r.totalPagamentos).toBe(0);
            expect(r.totalRecebido).toBe(0);
            expect(r.totalAguardando).toBe(0);
        });

        it('soma totalRecebido apenas de pagamentos PAGO', async () => {
            mockRepo.findAll.mockResolvedValue([
                makePag(StatusPagamento.PAGO, 100, 100),
                makePag(StatusPagamento.PAGO, 50, 50),
                makePag(StatusPagamento.AGUARDANDO_PAGAMENTO, 200, 0),
            ]);
            expect((await makeService().buscarResumo('u1')).totalRecebido).toBe(150);
        });

        it('soma totalAguardando apenas de pagamentos AGUARDANDO_PAGAMENTO', async () => {
            mockRepo.findAll.mockResolvedValue([
                makePag(StatusPagamento.AGUARDANDO_PAGAMENTO, 300, 0),
                makePag(StatusPagamento.PAGO, 100, 100),
            ]);
            expect((await makeService().buscarResumo('u1')).totalAguardando).toBe(300);
        });

        it('conta totalNaoAutorizado corretamente', async () => {
            mockRepo.findAll.mockResolvedValue([
                makePag(StatusPagamento.NAO_AUTORIZADO, 10),
                makePag(StatusPagamento.NAO_AUTORIZADO, 20),
            ]);
            expect((await makeService().buscarResumo('u1')).totalNaoAutorizado).toBe(2);
        });

        it('conta totalCancelado corretamente', async () => {
            mockRepo.findAll.mockResolvedValue([makePag(StatusPagamento.CANCELADO, 10)]);
            expect((await makeService().buscarResumo('u1')).totalCancelado).toBe(1);
        });

        it('conta totalVencido corretamente', async () => {
            mockRepo.findAll.mockResolvedValue([makePag(StatusPagamento.VENCIDO, 10)]);
            expect((await makeService().buscarResumo('u1')).totalVencido).toBe(1);
        });

        it('usa string vazia quando nomeCliente é undefined', async () => {
            const p = makePag(StatusPagamento.PAGO, 10, 10);
            (p as any).nomeCliente = undefined;
            mockRepo.findAll.mockResolvedValue([p]);
            const r = await makeService().buscarResumo('u1');
            expect(r.pagamentos[0].nomeCliente).toBe('');
        });

        it('inclui criadoEm como ISO string na lista', async () => {
            mockRepo.findAll.mockResolvedValue([makePag(StatusPagamento.PAGO, 10, 10)]);
            const r = await makeService().buscarResumo('u1');
            expect(typeof r.pagamentos[0].criadoEm).toBe('string');
        });
    });
});