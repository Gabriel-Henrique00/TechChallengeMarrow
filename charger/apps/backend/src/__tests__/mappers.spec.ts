import { ClienteMapper } from '../modules/clients/mappers/cliente.mapper';
import { UsuarioMapper } from '../modules/users/mappers/usuario.mapper';
import { PagamentoMapper } from '../modules/payment/mapper/pagamento.mapper';
import { StatusPagamento } from '../shared/enums/status-pagamento.enum';
import { StatusTentativa } from '../shared/enums/status-tentativa.enum';
import { ClienteModelo } from '../modules/clients/models/cliente.model';
import { UsuarioModelo } from '../modules/users/models/usuario.model';
import { PagamentoModelo } from '../modules/payment/models/pagamento.model';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeClienteModelo(overrides = {}): ClienteModelo {
    const m = new ClienteModelo();
    m.id           = 'c1';
    m.usuarioId    = 'u1';
    m.nome         = 'Maria';
    m.email        = 'maria@test.com';
    m.telefone     = '11999999999';
    m.documento    = '111.111.111-11';
    m.criadoEm     = new Date('2026-01-01T00:00:00Z');
    m.atualizadoEm = new Date('2026-01-02T00:00:00Z');
    return Object.assign(m, overrides);
}

function makeUsuarioModelo(overrides = {}): UsuarioModelo {
    const m = new UsuarioModelo();
    m.id           = 'u1';
    m.nome         = 'Gabriel';
    m.email        = 'gabriel@test.com';
    m.senhaHash    = 'hash';
    m.nomeEmpresa  = 'Charger';
    m.cnpj         = '11.111.111/0001-11';
    m.criadoEm     = new Date('2026-01-01T00:00:00Z');
    m.atualizadoEm = new Date('2026-01-02T00:00:00Z');
    return Object.assign(m, overrides);
}

function makePagamentoModelo(overrides = {}): PagamentoModelo {
    const m = new PagamentoModelo();
    m.id             = 'pag-1';
    m.usuarioId      = 'u1';
    m.clienteId      = 'c1';
    m.nome           = 'Mensalidade';
    m.descricao      = 'Março' as any;
    m.valor          = 100 as any;
    m.valorPago      = 0 as any;
    m.status         = StatusPagamento.AGUARDANDO_PAGAMENTO;
    m.idExterno      = null;
    m.dataVencimento = new Date('2026-04-01T00:00:00Z');
    m.criadoEm       = new Date('2026-01-01T00:00:00Z');
    m.atualizadoEm   = new Date('2026-01-02T00:00:00Z');
    m.tentativas     = [];
    m.cliente        = { nome: 'Maria' } as any;
    return Object.assign(m, overrides);
}

// ─── ClienteMapper ───────────────────────────────────────────────────────────

describe('ClienteMapper', () => {
    describe('toDomain()', () => {
        it('mapeia todos os campos corretamente', () => {
            const domain = ClienteMapper.toDomain(makeClienteModelo());
            expect(domain.id).toBe('c1');
            expect(domain.usuarioId).toBe('u1');
            expect(domain.nome).toBe('Maria');
            expect(domain.email).toBe('maria@test.com');
            expect(domain.telefone).toBe('11999999999');
            expect(domain.documento).toBe('111.111.111-11');
        });

        it('usa null quando telefone é undefined', () => {
            const domain = ClienteMapper.toDomain(makeClienteModelo({ telefone: undefined }));
            expect(domain.telefone).toBeNull();
        });
    });

    describe('toModel()', () => {
        it('mapeia campos para o modelo', () => {
            const domain = ClienteMapper.toDomain(makeClienteModelo());
            const model  = ClienteMapper.toModel(domain);
            expect(model.id).toBe('c1');
            expect(model.nome).toBe('Maria');
            expect(model.email).toBe('maria@test.com');
        });
    });

    describe('fromCreateDto()', () => {
        it('mapeia dto para domain com telefone', () => {
            const dto    = { nome: 'Ana', email: 'ana@t.com', documento: '222', telefone: '11888' };
            const domain = ClienteMapper.fromCreateDto(dto as any, 'u1');
            expect(domain.usuarioId).toBe('u1');
            expect(domain.telefone).toBe('11888');
        });

        it('usa null quando telefone é undefined no dto', () => {
            const dto    = { nome: 'Ana', email: 'ana@t.com', documento: '222' };
            const domain = ClienteMapper.fromCreateDto(dto as any, 'u1');
            expect(domain.telefone).toBeNull();
        });
    });

    describe('toResponseDto()', () => {
        it('retorna criadoEm como ISO string', () => {
            const domain = ClienteMapper.toDomain(makeClienteModelo());
            const dto    = ClienteMapper.toResponseDto(domain);
            expect(dto.criadoEm).toBe('2026-01-01T00:00:00.000Z');
        });
    });
});

// ─── UsuarioMapper ───────────────────────────────────────────────────────────

describe('UsuarioMapper', () => {
    describe('toDomain()', () => {
        it('mapeia todos os campos corretamente', () => {
            const domain = UsuarioMapper.toDomain(makeUsuarioModelo());
            expect(domain.id).toBe('u1');
            expect(domain.email).toBe('gabriel@test.com');
            expect(domain.senhaHash).toBe('hash');
            expect(domain.cnpj).toBe('11.111.111/0001-11');
        });
    });

    describe('toModel()', () => {
        it('mapeia campos para o modelo', () => {
            const domain = UsuarioMapper.toDomain(makeUsuarioModelo());
            const model  = UsuarioMapper.toModel(domain);
            expect(model.id).toBe('u1');
            expect(model.senhaHash).toBe('hash');
            expect(model.cnpj).toBe('11.111.111/0001-11');
        });
    });

    describe('toResponseDto()', () => {
        it('retorna criadoEm como ISO string e não expõe senhaHash', () => {
            const domain = UsuarioMapper.toDomain(makeUsuarioModelo());
            const dto    = UsuarioMapper.toResponseDto(domain);
            expect(dto.criadoEm).toBe('2026-01-01T00:00:00.000Z');
            expect(dto).not.toHaveProperty('senhaHash');
        });
    });
});

// ─── PagamentoMapper ─────────────────────────────────────────────────────────

describe('PagamentoMapper', () => {
    describe('toDomain()', () => {
        it('mapeia campos básicos corretamente', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo());
            expect(domain.id).toBe('pag-1');
            expect(domain.valor).toBe(100);
            expect(domain.valorPago).toBe(0);
            expect(domain.nomeCliente).toBe('Maria');
        });

        it('usa null quando descricao é undefined', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo({ descricao: undefined }));
            expect(domain.descricao).toBeNull();
        });

        it('usa null quando idExterno é undefined', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo({ idExterno: undefined }));
            expect(domain.idExterno).toBeNull();
        });

        it('nomeCliente é undefined quando cliente não está carregado', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo({ cliente: undefined }));
            expect(domain.nomeCliente).toBeUndefined();
        });

        it('retorna lista vazia de tentativas quando não há relação carregada', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo({ tentativas: undefined }));
            expect(domain.tentativas).toEqual([]);
        });

        it('mapeia tentativas quando presentes', () => {
            const tentativa = {
                id: 't1', pagamentoId: 'pag-1',
                status: StatusTentativa.PENDENTE,
                referenciaExterna: null, motivoFalha: null,
                valorTentativa: 100, respostaWebhook: null,
                dataTentativa: new Date(), criadoEm: new Date(),
            };
            const domain = PagamentoMapper.toDomain(makePagamentoModelo({ tentativas: [tentativa] as any }));
            expect(domain.tentativas).toHaveLength(1);
        });
    });

    describe('toModel()', () => {
        it('mapeia campos domain para modelo', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo());
            const model  = PagamentoMapper.toModel(domain);
            expect(model.id).toBe('pag-1');
            expect(model.valor).toBe(100);
            expect(model.status).toBe(StatusPagamento.AGUARDANDO_PAGAMENTO);
        });
    });

    describe('fromCreateDto()', () => {
        it('mapeia dto para domain', () => {
            const dto = {
                clienteId:      'c1',
                nome:           'Mensalidade',
                descricao:      'Março',
                valor:          150,
                dataVencimento: '2026-04-15T00:00:00-03:00',
            };
            const domain = PagamentoMapper.fromCreateDto(dto as any, 'u1');
            expect(domain.clienteId).toBe('c1');
            expect(domain.valor).toBe(150);
            expect(domain.descricao).toBe('Março');
        });

        it('usa null quando descricao é undefined', () => {
            const dto = {
                clienteId: 'c1', nome: 'Pag', valor: 10,
                dataVencimento: '2026-04-15T00:00:00Z',
            };
            const domain = PagamentoMapper.fromCreateDto(dto as any, 'u1');
            expect(domain.descricao).toBeNull();
        });
    });

    describe('toResponseDto()', () => {
        it('retorna datas como ISO string', () => {
            const domain = PagamentoMapper.toDomain(makePagamentoModelo());
            const dto    = PagamentoMapper.toResponseDto(domain, 'Maria');
            expect(dto.criadoEm).toBe('2026-01-01T00:00:00.000Z');
            expect(typeof dto.dataVencimento).toBe('string');
            expect(dto.nomeCliente).toBe('Maria');
        });
    });
});