import { VencimentoPagamentoScheduler } from '../modules/payment-attempts/vencimento-pagamento.scheduler';
import { StatusTentativa } from '../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { Pagamento } from '../modules/payment/entities/pagamento.entity';
import { TentativaTransacao } from '../modules/payment-attempts/entities/tentativa-transacao.entity';

const mockTentRepo = { findPendentesAntesDe: jest.fn(), update: jest.fn() };
const mockPagRepo  = { findByIdWithAttemptsInternal: jest.fn(), update: jest.fn() };
const makeScheduler = () => new VencimentoPagamentoScheduler(mockTentRepo as any, mockPagRepo as any);

function makeTentativa(overrides: Partial<TentativaTransacao> = {}): TentativaTransacao {
    return Object.assign(new TentativaTransacao(), {
        id: 'tent-1', pagamentoId: 'pag-1',
        status: StatusTentativa.PENDENTE, motivoFalha: null,
    }, overrides);
}

function makePagamento(overrides: Partial<Pagamento> = {}): Pagamento {
    const p = new Pagamento();
    p.id = 'pag-1'; p.status = StatusPagamento.AGUARDANDO_PAGAMENTO;
    p.valor = 100; p.valorPago = 0;
    p.dataVencimento = new Date(Date.now() + 86_400_000);
    p.tentativas = [];
    return Object.assign(p, overrides);
}

beforeEach(() => jest.clearAllMocks());

describe('PaymentExpiryScheduler', () => {
    describe('expirarTentativasAntigas()', () => {
        it('não faz nada quando não há tentativas pendentes', async () => {
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([]);
            await makeScheduler().expirarTentativasAntigas();
            expect(mockTentRepo.update).not.toHaveBeenCalled();
        });

        it('expira tentativas e atualiza status para NAO_AUTORIZADO', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t]);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeScheduler().expirarTentativasAntigas();
            expect(t.status).toBe(StatusTentativa.NAO_AUTORIZADO);
            expect(t.motivoFalha).toContain('5 minutos');
        });

        it('não reverte pagamento PAGO mesmo quando tentativa expira', async () => {
            const t = makeTentativa();
            const p = makePagamento({ status: StatusPagamento.PAGO });
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t]);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeScheduler().expirarTentativasAntigas();
            expect(p.status).toBe(StatusPagamento.PAGO);
            expect(mockPagRepo.update).not.toHaveBeenCalled();
        });

        it('continua para próxima tentativa quando pagamento não é encontrado', async () => {
            const t1 = makeTentativa({ id: 'a', pagamentoId: 'pag-x' });
            const t2 = makeTentativa({ id: 'b', pagamentoId: 'pag-2' });
            const p2 = makePagamento({ id: 'pag-2' });
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t1, t2]);
            mockPagRepo.findByIdWithAttemptsInternal
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(p2);
            await makeScheduler().expirarTentativasAntigas();
            expect(mockTentRepo.update).toHaveBeenCalledTimes(2);
            expect(p2.status).toBe(StatusPagamento.NAO_AUTORIZADO);
        });

        it('marca NAO_AUTORIZADO quando não há outra pendente ativa', async () => {
            const t = makeTentativa({ id: 'tent-1' });
            const p = makePagamento({ tentativas: [{ ...t, status: StatusTentativa.PENDENTE, id: 'tent-1' }] as any });
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t]);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeScheduler().expirarTentativasAntigas();
            expect(p.status).toBe(StatusPagamento.NAO_AUTORIZADO);
        });

        it('não altera pagamento quando há outra tentativa PENDENTE ativa', async () => {
            const t = makeTentativa({ id: 'tent-expirada' });
            const outraPendente = makeTentativa({ id: 'tent-ativa', status: StatusTentativa.PENDENTE });
            const p = makePagamento({ tentativas: [outraPendente] });
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t]);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeScheduler().expirarTentativasAntigas();
            expect(p.status).toBe(StatusPagamento.AGUARDANDO_PAGAMENTO);
            expect(mockPagRepo.update).not.toHaveBeenCalled();
        });

        it('marca pagamento como VENCIDO quando dataVencimento está no passado', async () => {
            const t = makeTentativa();
            const p = makePagamento({ dataVencimento: new Date(Date.now() - 1000) });
            mockTentRepo.findPendentesAntesDe.mockResolvedValue([t]);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeScheduler().expirarTentativasAntigas();
            expect(p.status).toBe(StatusPagamento.VENCIDO);
        });

        it('captura erro e não propaga exceção', async () => {
            mockTentRepo.findPendentesAntesDe.mockRejectedValue(new Error('DB down'));
            await expect(makeScheduler().expirarTentativasAntigas()).resolves.toBeUndefined();
        });
    });
});