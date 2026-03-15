import { BadRequestException } from '@nestjs/common';
import { TentativasTransacaoService } from '../modules/payment-attempts/tentativa-transacao.service';
import { StatusTentativa } from '../shared/enums/status-tentativa.enum';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { ResourceNotFoundException } from '../shared/exceptions/resource-not-found.exception';
import { PaymentAlreadyPaidException } from '../shared/exceptions/payment-already-paid.exception';
import { PagamentoModelo } from '../modules/payment/models/pagamento.model';

const mockTentRepo    = { create: jest.fn(), findByPaymentId: jest.fn(), update: jest.fn() };
const mockPagRepo     = {
    findByIdWithAttemptsInternal: jest.fn(),
    findByIdWithAttempts:         jest.fn(),
    findById:                     jest.fn(),
    update:                       jest.fn(),
};
const mockPayProvider = { initiatePayment: jest.fn() };
const mockManager     = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const mockDataSource  = { transaction: jest.fn((cb: any) => cb(mockManager)) };

const makeService = () => new TentativasTransacaoService(
    mockTentRepo as any, mockPagRepo as any,
    mockPayProvider as any, mockDataSource as any,
);

function makePagamentoModelo(overrides = {}): PagamentoModelo {
    const m = new PagamentoModelo();
    m.id = 'pag-1'; m.usuarioId = 'u1'; m.clienteId = 'c1';
    m.nome = 'Mensalidade'; m.descricao = null;
    m.valor = 100 as any; m.valorPago = 0 as any;
    m.status = StatusPagamento.AGUARDANDO_PAGAMENTO;
    m.idExterno = null;
    m.dataVencimento = new Date(Date.now() + 86_400_000);
    m.tentativas = []; m.criadoEm = new Date(); m.atualizadoEm = new Date();
    m.cliente = { nome: 'Maria' } as any;
    return Object.assign(m, overrides);
}

function makeTentativaModelo(): any {
    return {
        id: 'tent-1', pagamentoId: 'pag-1', status: StatusTentativa.PENDENTE,
        referenciaExterna: 'ref-1', motivoFalha: null, valorTentativa: 100,
        respostaWebhook: null, dataTentativa: new Date(), criadoEm: new Date(),
    };
}

beforeEach(() => jest.clearAllMocks());

describe('TentativasTransacaoService', () => {
    describe('createPublico()', () => {
        it('lança ResourceNotFoundException quando pagamento não existe', async () => {
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue(null);
            await expect(makeService().createPublico('pag-x')).rejects.toThrow(ResourceNotFoundException);
        });

        it('cria tentativa com sucesso e retorna paymentUrl', async () => {
            mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue({});
            mockManager.findOne.mockResolvedValue(makePagamentoModelo());
            mockManager.create.mockReturnValue(makeTentativaModelo());
            mockManager.save.mockResolvedValue(makeTentativaModelo());
            mockPayProvider.initiatePayment.mockResolvedValue({
                status: StatusTentativa.PENDENTE, referenciaExterna: 'ref-1',
                motivoFalha: null, paymentUrl: 'https://pay.pluggy.ai/1',
            });
            const result = await makeService().createPublico('pag-1');
            expect(result.paymentUrl).toBe('https://pay.pluggy.ai/1');
        });
    });

    describe('create()', () => {
        it('lança ResourceNotFoundException quando pagamento não pertence ao usuário', async () => {
            mockPagRepo.findByIdWithAttempts.mockResolvedValue(null);
            await expect(makeService().create('pag-x', 'u1')).rejects.toThrow(ResourceNotFoundException);
        });
    });

    describe('findByPaymentId()', () => {
        it('lança ResourceNotFoundException quando pagamento não encontrado', async () => {
            mockPagRepo.findById.mockResolvedValue(null);
            await expect(makeService().findByPaymentId('x', 'u1')).rejects.toThrow(ResourceNotFoundException);
        });

        it('retorna lista de tentativas', async () => {
            mockPagRepo.findById.mockResolvedValue({});
            mockTentRepo.findByPaymentId.mockResolvedValue([makeTentativaModelo()]);
            expect(await makeService().findByPaymentId('pag-1', 'u1')).toHaveLength(1);
        });
    });

    describe('processarTentativa() — branches internos', () => {
        beforeEach(() => { mockPagRepo.findByIdWithAttemptsInternal.mockResolvedValue({}); });

        it('lança ResourceNotFoundException quando lock não encontra pagamento', async () => {
            mockManager.findOne.mockResolvedValue(null);
            await expect(makeService().createPublico('pag-x')).rejects.toThrow(ResourceNotFoundException);
        });

        it('lança PaymentAlreadyPaidException quando status é PAGO', async () => {
            mockManager.findOne.mockResolvedValue(makePagamentoModelo({ status: StatusPagamento.PAGO }));
            await expect(makeService().createPublico('pag-1')).rejects.toThrow(PaymentAlreadyPaidException);
        });

        it('lança BadRequestException e salva vencido quando pagamento está vencido', async () => {
            const modelo = makePagamentoModelo({ dataVencimento: new Date(Date.now() - 1000) });
            mockManager.findOne.mockResolvedValue(modelo);
            mockManager.save.mockResolvedValue(modelo);
            await expect(makeService().createPublico('pag-1')).rejects.toThrow(BadRequestException);
            expect(mockManager.save).toHaveBeenCalled();
        });

        it('lança BadRequestException quando há tentativa pendente ativa', async () => {
            const tentativaAtiva = { id: 'tent-ativa', status: StatusTentativa.PENDENTE, criadoEm: new Date() };
            mockManager.findOne.mockResolvedValue(makePagamentoModelo({ tentativas: [tentativaAtiva] as any }));
            await expect(makeService().createPublico('pag-1')).rejects.toThrow(BadRequestException);
        });

        it('marca NAO_AUTORIZADO e salva pagamento quando provedor retorna FALHA', async () => {
            const tentativaFalha = { ...makeTentativaModelo(), status: StatusTentativa.FALHA };
            mockManager.findOne.mockResolvedValue(makePagamentoModelo());
            mockManager.create.mockReturnValue(tentativaFalha);
            mockManager.save
                .mockResolvedValueOnce(tentativaFalha)
                .mockResolvedValueOnce({});
            mockPayProvider.initiatePayment.mockResolvedValue({
                status: StatusTentativa.FALHA, referenciaExterna: null,
                motivoFalha: 'Recusado', paymentUrl: null,
            });
            const result = await makeService().createPublico('pag-1');
            expect(result.status).toBe(StatusTentativa.FALHA);
            expect(mockManager.save).toHaveBeenCalledTimes(2);
        });

        it('usa nome como descricao quando descricao é null', async () => {
            const tentativaModelo = makeTentativaModelo();
            mockManager.findOne.mockResolvedValue(makePagamentoModelo({ descricao: null }));
            mockManager.create.mockReturnValue(tentativaModelo);
            mockManager.save.mockResolvedValue(tentativaModelo);
            mockPayProvider.initiatePayment.mockResolvedValue({
                status: StatusTentativa.PENDENTE, referenciaExterna: 'ref-1',
                motivoFalha: null, paymentUrl: 'https://pay.pluggy.ai/1',
            });
            await makeService().createPublico('pag-1');
            expect(mockPayProvider.initiatePayment).toHaveBeenCalledWith(
                expect.objectContaining({ descricao: 'Mensalidade' }),
            );
        });
    });
});