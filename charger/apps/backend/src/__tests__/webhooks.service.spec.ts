import { WebhooksService } from '../modules/webhooks/webhooks.service';
import { StatusTentativa } from '../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { Pagamento } from '../modules/payment/entities/pagamento.entity';
import { TentativaTransacao } from '../modules/payment-attempts/entities/tentativa-transacao.entity';

const mockPagRepo  = { findByIdWithAttemptsInternal: jest.fn(), update: jest.fn() };
const mockTentRepo = { findByReferenciaExterna: jest.fn(), update: jest.fn() };
const makeService  = () => new WebhooksService(mockPagRepo as any, mockTentRepo as any);

function makeTentativa(overrides: Partial<TentativaTransacao> = {}): TentativaTransacao {
    return Object.assign(new TentativaTransacao(), {
        id: 'tent-1', pagamentoId: 'pag-1', status: StatusTentativa.PENDENTE,
        referenciaExterna: 'req-1', motivoFalha: null, valorTentativa: 100,
        respostaWebhook: null, dataTentativa: new Date(), criadoEm: new Date(),
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

describe('WebhooksService', () => {
    describe('processarPluggy()', () => {
        it('ignora payload sem paymentRequestId', async () => {
            await makeService().processarPluggy({ event: 'payment_intent/completed' });
            expect(mockTentRepo.findByReferenciaExterna).not.toHaveBeenCalled();
        });

        it('resolve paymentRequestId da raiz do payload', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'algum', paymentRequestId: 'req-1' });
            expect(mockTentRepo.findByReferenciaExterna).toHaveBeenCalledWith('req-1');
        });

        it('resolve paymentRequestId de payload.data.paymentRequestId', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'algum', data: { paymentRequestId: 'req-2' } });
            expect(mockTentRepo.findByReferenciaExterna).toHaveBeenCalledWith('req-2');
        });

        it('resolve paymentRequestId de payload.data.id', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'algum', data: { id: 'req-3' } });
            expect(mockTentRepo.findByReferenciaExterna).toHaveBeenCalledWith('req-3');
        });

        it('ignora evento sem mapeamento de status', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'evento_desconhecido', paymentRequestId: 'req-1' });
            expect(mockTentRepo.update).not.toHaveBeenCalled();
        });

        it('ignora tentativa não encontrada', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1' });
            expect(mockPagRepo.update).not.toHaveBeenCalled();
        });

        it('não regride status de SUCESSO para outro status', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(makeTentativa({ status: StatusTentativa.SUCESSO }));
            await makeService().processarPluggy({ event: 'payment_intent/error', paymentRequestId: 'req-1' });
            expect(mockTentRepo.update).not.toHaveBeenCalled();
        });

        it('processa payment_request/updated COMPLETED → PAGO', async () => {
            const t = makeTentativa();
            const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({
                event: 'payment_request/updated', status: 'COMPLETED',
                paymentRequestId: 'req-1', amount: 100,
            });
            expect(p.status).toBe(StatusPagamento.PAGO);
        });

        it('ignora payment_request/updated com status intermediário', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(makeTentativa());
            await makeService().processarPluggy({
                event: 'payment_request/updated', status: 'WAITING', paymentRequestId: 'req-1',
            });
            expect(mockTentRepo.update).not.toHaveBeenCalled();
        });

        it('marca PAGO quando amount confere', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1', amount: 100 });
            expect(p.status).toBe(StatusPagamento.PAGO);
            expect(p.valorPago).toBe(100);
        });

        it('aceita amount dentro da tolerância de R$ 0,01', async () => {
            const t = makeTentativa(); const p = makePagamento({ valor: 100 });
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1', amount: 100.01 });
            expect(p.status).toBe(StatusPagamento.PAGO);
        });

        it('marca NAO_AUTORIZADO quando amount está ausente', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1' });
            expect(p.status).toBe(StatusPagamento.NAO_AUTORIZADO);
        });

        it('extrai amount de payload.data.amount', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1', data: { amount: 100 } });
            expect(p.status).toBe(StatusPagamento.PAGO);
        });

        it('extrai amount de payload.data.value', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1', data: { value: 100 } });
            expect(p.status).toBe(StatusPagamento.PAGO);
        });

        it('marca NAO_AUTORIZADO quando há divergência de valor acima de R$ 0,01', async () => {
            const t = makeTentativa(); const p = makePagamento({ valor: 100 });
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/completed', paymentRequestId: 'req-1', amount: 50 });
            expect(p.status).toBe(StatusPagamento.NAO_AUTORIZADO);
        });

        it('marca NAO_AUTORIZADO quando evento é payment_intent/error', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/error', paymentRequestId: 'req-1' });
            expect(p.status).toBe(StatusPagamento.NAO_AUTORIZADO);
        });

        it('não atualiza pagamento quando pagamento não é encontrado', async () => {
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(makeTentativa());
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(null);
            await makeService().processarPluggy({ event: 'payment_intent/error', paymentRequestId: 'req-1' });
            expect(mockPagRepo.update).not.toHaveBeenCalled();
        });

        it('não altera pagamento para evento waiting_payer_authorization', async () => {
            const t = makeTentativa(); const p = makePagamento();
            mockTentRepo.findByReferenciaExterna.mockResolvedValue(t);
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(p);
            await makeService().processarPluggy({ event: 'payment_intent/waiting_payer_authorization', paymentRequestId: 'req-1' });
            expect(mockPagRepo.update).not.toHaveBeenCalled();
        });
    });
});