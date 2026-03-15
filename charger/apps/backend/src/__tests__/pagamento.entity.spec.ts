import { Pagamento, EXPIRACAO_TENTATIVA_MS } from '../modules/payment/entities/pagamento.entity';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { StatusTentativa } from '../shared/enums/status-tentativa.enum';
import { TentativaTransacao } from '../modules/payment-attempts/entities/tentativa-transacao.entity';

function makePagamento(overrides: Partial<Pagamento> = {}): Pagamento {
  const p = new Pagamento();
  p.id             = 'pag-1';
  p.status         = StatusPagamento.AGUARDANDO_PAGAMENTO;
  p.valor          = 100;
  p.valorPago      = 0;
  p.dataVencimento = new Date(Date.now() + 60_000);
  p.tentativas     = [];
  return Object.assign(p, overrides);
}

function makeTentativa(overrides: Partial<TentativaTransacao> = {}): TentativaTransacao {
  const t = new TentativaTransacao();
  t.id                = 'tent-1';
  t.status            = StatusTentativa.PENDENTE;
  t.criadoEm          = new Date();
  t.motivoFalha       = null;
  t.referenciaExterna = null;
  t.respostaWebhook   = null;
  t.valorTentativa    = 100;
  t.dataTentativa     = new Date();
  t.pagamentoId       = 'pag-1';
  return Object.assign(t, overrides);
}

describe('Pagamento entity', () => {

  describe('podeReceberTentativa()', () => {
    it('retorna false quando status é PAGO', () => {
      const p = makePagamento({ status: StatusPagamento.PAGO });
      expect(p.podeReceberTentativa()).toBe(false);
    });

    it('retorna false quando status é VENCIDO', () => {
      const p = makePagamento({ status: StatusPagamento.VENCIDO });
      expect(p.podeReceberTentativa()).toBe(false);
    });

    it('retorna false quando dataVencimento está no passado', () => {
      const p = makePagamento({ dataVencimento: new Date(Date.now() - 1000) });
      expect(p.podeReceberTentativa()).toBe(false);
    });

    it('retorna false quando há tentativa PENDENTE ainda dentro do prazo', () => {
      const t = makeTentativa({ criadoEm: new Date() });
      const p = makePagamento({ tentativas: [t] });
      expect(p.podeReceberTentativa()).toBe(false);
    });

    it('retorna true quando tentativa PENDENTE já expirou (> 5 min)', () => {
      const criadoEm = new Date(Date.now() - EXPIRACAO_TENTATIVA_MS - 1000);
      const t = makeTentativa({ criadoEm });
      const p = makePagamento({ tentativas: [t] });
      expect(p.podeReceberTentativa()).toBe(true);
    });

    it('retorna true quando tentativa não é PENDENTE', () => {
      const t = makeTentativa({ status: StatusTentativa.SUCESSO });
      const p = makePagamento({ tentativas: [t] });
      expect(p.podeReceberTentativa()).toBe(true);
    });

    it('retorna true quando tentativas é undefined', () => {
      const p = makePagamento({ tentativas: undefined as any });
      expect(p.podeReceberTentativa()).toBe(true);
    });

    it('retorna true sem tentativas e pagamento válido', () => {
      expect(makePagamento().podeReceberTentativa()).toBe(true);
    });
  });

  describe('estaVencido()', () => {
    it('retorna false quando status é PAGO', () => {
      const p = makePagamento({
        status:         StatusPagamento.PAGO,
        dataVencimento: new Date(Date.now() - 1000),
      });
      expect(p.estaVencido()).toBe(false);
    });

    it('retorna false quando dataVencimento está no futuro', () => {
      expect(makePagamento().estaVencido()).toBe(false);
    });

    it('retorna true quando não está pago e data está no passado', () => {
      const p = makePagamento({ dataVencimento: new Date(Date.now() - 1000) });
      expect(p.estaVencido()).toBe(true);
    });
  });

  describe('adicionarTentativa()', () => {
    it('adiciona a tentativa à lista existente', () => {
      const p = makePagamento();
      const t = makeTentativa();
      p.adicionarTentativa(t);
      expect(p.tentativas).toHaveLength(1);
      expect(p.tentativas[0]).toBe(t);
    });

    it('inicializa a lista quando tentativas é undefined', () => {
      const p = makePagamento({ tentativas: undefined as any });
      p.adicionarTentativa(makeTentativa());
      expect(p.tentativas).toHaveLength(1);
    });

    it('não muta o array original (spread)', () => {
      const t1       = makeTentativa({ id: 'a' });
      const t2       = makeTentativa({ id: 'b' });
      const p        = makePagamento({ tentativas: [t1] });
      const original = p.tentativas;
      p.adicionarTentativa(t2);
      expect(p.tentativas).not.toBe(original);
      expect(p.tentativas).toHaveLength(2);
    });
  });

  describe('marcarComoPago()', () => {
    it('define status PAGO e valorPago', () => {
      const p = makePagamento();
      p.marcarComoPago(99.99);
      expect(p.status).toBe(StatusPagamento.PAGO);
      expect(p.valorPago).toBe(99.99);
    });
  });

  describe('marcarComoNaoAutorizado()', () => {
    it('define status NAO_AUTORIZADO', () => {
      const p = makePagamento();
      p.marcarComoNaoAutorizado();
      expect(p.status).toBe(StatusPagamento.NAO_AUTORIZADO);
    });
  });

  describe('marcarComoVencido()', () => {
    it('define status VENCIDO', () => {
      const p = makePagamento();
      p.marcarComoVencido();
      expect(p.status).toBe(StatusPagamento.VENCIDO);
    });
  });

  describe('ultimaTentativaSucedeu()', () => {
    it('retorna false quando não há tentativas', () => {
      expect(makePagamento().ultimaTentativaSucedeu()).toBe(false);
    });

    it('retorna false quando tentativas é undefined', () => {
      const p = makePagamento({ tentativas: undefined as any });
      expect(p.ultimaTentativaSucedeu()).toBe(false);
    });

    it('retorna false quando a última tentativa não é SUCESSO', () => {
      const t = makeTentativa({ status: StatusTentativa.FALHA });
      const p = makePagamento({ tentativas: [t] });
      expect(p.ultimaTentativaSucedeu()).toBe(false);
    });

    it('retorna true quando a última tentativa é SUCESSO', () => {
      const t = makeTentativa({ status: StatusTentativa.SUCESSO });
      const p = makePagamento({ tentativas: [t] });
      expect(p.ultimaTentativaSucedeu()).toBe(true);
    });

    it('avalia apenas a última tentativa, não as anteriores', () => {
      const t1 = makeTentativa({ id: 'a', status: StatusTentativa.SUCESSO });
      const t2 = makeTentativa({ id: 'b', status: StatusTentativa.FALHA });
      const p  = makePagamento({ tentativas: [t1, t2] });
      expect(p.ultimaTentativaSucedeu()).toBe(false);
    });
  });
});