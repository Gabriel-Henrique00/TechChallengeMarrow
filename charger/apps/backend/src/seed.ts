import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

function daysAgo(n: number): Date {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return new Date(d.getTime() - n * 24 * 60 * 60 * 1000);
}

function monthsAgo(m: number, day = 10): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    d.setDate(day);
    d.setHours(9, 30, 0, 0);
    return d;
}

function daysFromDate(base: Date, n: number): Date {
    return new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
}

type PagStatus  = 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'NAO_AUTORIZADO' | 'CANCELADO' | 'VENCIDO';
type TentStatus = 'SUCESSO' | 'FALHA' | 'NAO_AUTORIZADO' | 'PENDENTE';

interface Tentativa {
    status:    TentStatus;
    diasAtras: number;
    motivo?:   string;
    refExt?:   string;
}

interface PagDef {
    clienteIdx:  number;
    nome:        string;
    descricao?:  string;
    valor:       number;
    valorPago?:  number;
    status:      PagStatus;
    criadoMeses: number;
    criadoDia?:  number;
    vencDias:    number;
    tentativas:  Tentativa[];
}

export async function runSeedIfEmpty(dataSource: DataSource): Promise<void> {
    const [{ total }] = await dataSource.query(
        `SELECT COUNT(*) as total FROM usuarios`,
    );

    if (parseInt(total) > 0) return;

    const q = dataSource.createQueryRunner();
    await q.connect();
    await q.startTransaction();

    try {
        const usuarioId = uuid();
        const senhaHash = await bcrypt.hash('charger123', 10);

        await q.query(`
            INSERT INTO usuarios (id, nome, email, senha_hash, nome_empresa, cnpj)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [usuarioId, 'Charger Admin', 'charger@charger.com', senhaHash, 'Charger Cobranças Ltda', '12345678000195']);

        const clientes = [
            { id: uuid(), nome: 'Ana Paula Ferreira',    email: 'ana.paula@email.com',     telefone: '11987654321', documento: '12345678901' },
            { id: uuid(), nome: 'Bruno Oliveira Santos', email: 'bruno.oliveira@email.com', telefone: '21976543210', documento: '23456789012' },
            { id: uuid(), nome: 'Carla Mendes Lima',     email: 'carla.mendes@email.com',   telefone: '31965432109', documento: '34567890123' },
            { id: uuid(), nome: 'Diego Alves Costa',     email: 'diego.alves@email.com',    telefone: null,          documento: '45678901234' },
            { id: uuid(), nome: 'Eduarda Ramos Silva',   email: 'eduarda.ramos@email.com',  telefone: '51954321098', documento: '56789012345' },
            { id: uuid(), nome: 'Felipe Gomes Torres',   email: 'felipe.gomes@email.com',   telefone: '41943210987', documento: '67890123456' },
            { id: uuid(), nome: 'Gabriela Souza Nunes',  email: 'gabriela.souza@email.com', telefone: '61932109876', documento: '78901234567' },
            { id: uuid(), nome: 'Henrique Castro Pinto', email: 'henrique.castro@email.com',telefone: null,          documento: '89012345678' },
        ];

        for (const c of clientes) {
            await q.query(`
                INSERT INTO clientes (id, usuario_id, nome, email, telefone, documento)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [c.id, usuarioId, c.nome, c.email, c.telefone, c.documento]);
        }

        const pagamentos: PagDef[] = [

            // ── 6 meses atrás ────────────────────────────────────────────────
            {
                clienteIdx: 0, nome: 'Consultoria Estratégica Jan', descricao: 'Planejamento estratégico Q1',
                valor: 4200.00, valorPago: 4200.00, status: 'PAGO',
                criadoMeses: 6, criadoDia: 5, vencDias: 30,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 155, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'SUCESSO', diasAtras: 148, refExt: 'pluggy-ref-jan-01' },
                ],
            },
            {
                clienteIdx: 1, nome: 'Licença ERP Anual', descricao: 'Renovação anual sistema ERP corporativo',
                valor: 18500.00, valorPago: 18500.00, status: 'PAGO',
                criadoMeses: 6, criadoDia: 8, vencDias: 45,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 140, refExt: 'pluggy-ref-jan-02' },
                ],
            },
            {
                clienteIdx: 2, nome: 'Desenvolvimento Web Jan', descricao: 'Sprint 1 — frontend dashboard',
                valor: 6800.00, valorPago: 6800.00, status: 'PAGO',
                criadoMeses: 6, criadoDia: 12, vencDias: 30,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 165, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                    { status: 'NAO_AUTORIZADO', diasAtras: 158, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                    { status: 'SUCESSO',         diasAtras: 150, refExt: 'pluggy-ref-jan-03' },
                ],
            },
            {
                clienteIdx: 3, nome: 'Suporte Premium Jan',
                valor: 2200.00, valorPago: 2200.00, status: 'PAGO',
                criadoMeses: 6, criadoDia: 15, vencDias: 20,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 162, refExt: 'pluggy-ref-jan-04' },
                ],
            },
            {
                clienteIdx: 4, nome: 'Treinamento Equipe Jan', descricao: 'Capacitação em sistemas financeiros',
                valor: 3100.00, valorPago: 3100.00, status: 'PAGO',
                criadoMeses: 6, criadoDia: 20, vencDias: 25,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 160, motivo: 'Banco temporariamente indisponível.' },
                    { status: 'SUCESSO', diasAtras: 153, refExt: 'pluggy-ref-jan-05' },
                ],
            },

            // ── 5 meses atrás ────────────────────────────────────────────────
            {
                clienteIdx: 5, nome: 'Projeto Mobile Fev', descricao: 'App de gestão de cobranças iOS/Android',
                valor: 14000.00, valorPago: 14000.00, status: 'PAGO',
                criadoMeses: 5, criadoDia: 3, vencDias: 40,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 128, refExt: 'pluggy-ref-fev-01' },
                ],
            },
            {
                clienteIdx: 0, nome: 'Consultoria Fevereiro', descricao: 'Otimização de processos contábeis',
                valor: 4200.00, valorPago: 4200.00, status: 'PAGO',
                criadoMeses: 5, criadoDia: 7, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 120, refExt: 'pluggy-ref-fev-02' },
                ],
            },
            {
                clienteIdx: 6, nome: 'Implementação Módulo Fiscal', descricao: 'SPED Fiscal e EFD-Contribuições',
                valor: 9500.00, valorPago: 9500.00, status: 'PAGO',
                criadoMeses: 5, criadoDia: 10, vencDias: 35,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 130, motivo: 'Transação recusada pela instituição financeira.' },
                    { status: 'FALHA',   diasAtras: 123, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'SUCESSO', diasAtras: 115, refExt: 'pluggy-ref-fev-03' },
                ],
            },
            {
                clienteIdx: 7, nome: 'Auditoria de Sistemas Fev', descricao: 'Auditoria de segurança e conformidade',
                valor: 7200.00, valorPago: 7200.00, status: 'PAGO',
                criadoMeses: 5, criadoDia: 18, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 112, refExt: 'pluggy-ref-fev-04' },
                ],
            },

            // ── 4 meses atrás ────────────────────────────────────────────────
            {
                clienteIdx: 1, nome: 'Integração Bancária Mar', descricao: 'Open Finance — 3 bancos',
                valor: 11200.00, valorPago: 11200.00, status: 'PAGO',
                criadoMeses: 4, criadoDia: 4, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 95, refExt: 'pluggy-ref-mar-01' },
                ],
            },
            {
                clienteIdx: 2, nome: 'Desenvolvimento Backend Mar', descricao: 'Sprint 2 — APIs de cobrança',
                valor: 7400.00, valorPago: 7400.00, status: 'PAGO',
                criadoMeses: 4, criadoDia: 9, vencDias: 30,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 100, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                    { status: 'SUCESSO',         diasAtras: 90,  refExt: 'pluggy-ref-mar-02' },
                ],
            },
            {
                clienteIdx: 3, nome: 'Suporte Premium Mar',
                valor: 2200.00, valorPago: 2200.00, status: 'PAGO',
                criadoMeses: 4, criadoDia: 14, vencDias: 20,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 88, refExt: 'pluggy-ref-mar-03' },
                ],
            },
            {
                clienteIdx: 4, nome: 'Workshop Power BI Mar', descricao: 'Visualização de dados financeiros',
                valor: 2800.00, valorPago: 2800.00, status: 'PAGO',
                criadoMeses: 4, criadoDia: 20, vencDias: 25,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 82, refExt: 'pluggy-ref-mar-04' },
                ],
            },
            {
                clienteIdx: 5, nome: 'Licença Vencida Mar', descricao: 'Cliente não realizou o pagamento no prazo',
                valor: 5600.00, status: 'VENCIDO',
                criadoMeses: 4, criadoDia: 25, vencDias: -20,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 85, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },

            // ── 3 meses atrás ────────────────────────────────────────────────
            {
                clienteIdx: 6, nome: 'Consultoria BI Abril', descricao: 'Implantação de dashboards gerenciais',
                valor: 8100.00, valorPago: 8100.00, status: 'PAGO',
                criadoMeses: 3, criadoDia: 3, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 65, refExt: 'pluggy-ref-abr-01' },
                ],
            },
            {
                clienteIdx: 7, nome: 'Migração Cloud Abril', descricao: 'Migração de infraestrutura para AWS',
                valor: 22000.00, valorPago: 22000.00, status: 'PAGO',
                criadoMeses: 3, criadoDia: 8, vencDias: 45,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 72, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'SUCESSO', diasAtras: 60, refExt: 'pluggy-ref-abr-02' },
                ],
            },
            {
                clienteIdx: 0, nome: 'Consultoria Abril',
                valor: 4200.00, valorPago: 4200.00, status: 'PAGO',
                criadoMeses: 3, criadoDia: 12, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 58, refExt: 'pluggy-ref-abr-03' },
                ],
            },
            {
                clienteIdx: 3, nome: 'Suporte Premium Abr',
                valor: 2200.00, valorPago: 2200.00, status: 'PAGO',
                criadoMeses: 3, criadoDia: 28, vencDias: 20,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 55, refExt: 'pluggy-ref-abr-04' },
                ],
            },
            {
                clienteIdx: 1, nome: 'Projeto Alpha Cancelado Abr', descricao: 'Cancelado por mudança estratégica do cliente',
                valor: 31000.00, status: 'CANCELADO',
                criadoMeses: 3, criadoDia: 15, vencDias: 60,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 70, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },
            {
                clienteIdx: 2, nome: 'Dev Mobile Abr Cancelado', descricao: 'Escopo redefinido e reaberto em novo contrato',
                valor: 13500.00, status: 'CANCELADO',
                criadoMeses: 3, criadoDia: 22, vencDias: 45,
                tentativas: [],
            },
            {
                clienteIdx: 4, nome: 'Implantação ERP Abr Vencido', descricao: 'Prazo encerrado sem pagamento',
                valor: 9800.00, status: 'VENCIDO',
                criadoMeses: 3, criadoDia: 10, vencDias: -15,
                tentativas: [],
            },
            {
                clienteIdx: 5, nome: 'Suporte N2 Abr Não Autorizado',
                valor: 4800.00, status: 'NAO_AUTORIZADO',
                criadoMeses: 3, criadoDia: 18, vencDias: 60,
                tentativas: [
                    { status: 'FALHA',         diasAtras: 68, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'NAO_AUTORIZADO', diasAtras: 62, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },

            // ── 2 meses atrás ────────────────────────────────────────────────
            {
                clienteIdx: 4, nome: 'Treinamento Azure Maio', descricao: 'Capacitação em cloud computing',
                valor: 3600.00, valorPago: 3600.00, status: 'PAGO',
                criadoMeses: 2, criadoDia: 5, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 38, refExt: 'pluggy-ref-mai-01' },
                ],
            },
            {
                clienteIdx: 5, nome: 'Suporte N2 Maio',
                valor: 4800.00, valorPago: 4800.00, status: 'PAGO',
                criadoMeses: 2, criadoDia: 8, vencDias: 25,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 42, motivo: 'Banco temporariamente indisponível.' },
                    { status: 'FALHA',   diasAtras: 35, motivo: 'Transação recusada pela instituição financeira.' },
                    { status: 'SUCESSO', diasAtras: 28, refExt: 'pluggy-ref-mai-02' },
                ],
            },
            {
                clienteIdx: 6, nome: 'Relatório Executivo Q2', descricao: 'Relatório gerencial de resultados',
                valor: 3200.00, valorPago: 3200.00, status: 'PAGO',
                criadoMeses: 2, criadoDia: 12, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 32, refExt: 'pluggy-ref-mai-03' },
                ],
            },
            {
                clienteIdx: 0, nome: 'Consultoria Maio',
                valor: 4200.00, valorPago: 4200.00, status: 'PAGO',
                criadoMeses: 2, criadoDia: 20, vencDias: 30,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 25, refExt: 'pluggy-ref-mai-04' },
                ],
            },
            {
                clienteIdx: 1, nome: 'Suporte Premium Mai',
                valor: 2200.00, valorPago: 2200.00, status: 'PAGO',
                criadoMeses: 2, criadoDia: 25, vencDias: 20,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 22, refExt: 'pluggy-ref-mai-05' },
                ],
            },
            {
                clienteIdx: 7, nome: 'Segurança da Informação Mai', descricao: 'Pentest e análise de vulnerabilidades',
                valor: 16500.00, status: 'NAO_AUTORIZADO',
                criadoMeses: 2, criadoDia: 16, vencDias: 60,
                tentativas: [
                    { status: 'FALHA',         diasAtras: 45, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'NAO_AUTORIZADO', diasAtras: 38, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                    { status: 'NAO_AUTORIZADO', diasAtras: 30, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },
            {
                clienteIdx: 2, nome: 'Dev Full Stack Mai Vencido', descricao: 'Sprint 3 — prazo encerrado',
                valor: 8900.00, status: 'VENCIDO',
                criadoMeses: 2, criadoDia: 28, vencDias: -5,
                tentativas: [],
            },
            {
                clienteIdx: 3, nome: 'Integração Legado Mai Cancelado', descricao: 'Projeto descontinuado',
                valor: 12000.00, status: 'CANCELADO',
                criadoMeses: 2, criadoDia: 14, vencDias: 40,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 40, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },

            // ── Mês atual — todos os status ──────────────────────────────────

            // PAGOS
            {
                clienteIdx: 0, nome: 'Consultoria Junho', descricao: 'Auditoria contábil mensal',
                valor: 4200.00, valorPago: 4200.00, status: 'PAGO',
                criadoMeses: 0, criadoDia: 2, vencDias: 20,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 8, refExt: 'pluggy-ref-jun-01' },
                ],
            },
            {
                clienteIdx: 3, nome: 'Suporte Premium Jun',
                valor: 2200.00, valorPago: 2200.00, status: 'PAGO',
                criadoMeses: 0, criadoDia: 3, vencDias: 18,
                tentativas: [
                    { status: 'FALHA',   diasAtras: 10, motivo: 'Banco temporariamente indisponível.' },
                    { status: 'SUCESSO', diasAtras: 5,  refExt: 'pluggy-ref-jun-02' },
                ],
            },
            {
                clienteIdx: 6, nome: 'Relatório Semestral H1', descricao: 'Análise de performance primeiro semestre',
                valor: 5500.00, valorPago: 5500.00, status: 'PAGO',
                criadoMeses: 0, criadoDia: 4, vencDias: 15,
                tentativas: [
                    { status: 'SUCESSO', diasAtras: 3, refExt: 'pluggy-ref-jun-03' },
                ],
            },

            // NÃO AUTORIZADOS
            {
                clienteIdx: 7, nome: 'Consultoria DevOps Jun', descricao: 'Implantação de pipeline CI/CD',
                valor: 11000.00, status: 'NAO_AUTORIZADO',
                criadoMeses: 0, criadoDia: 5, vencDias: 35,
                tentativas: [
                    { status: 'FALHA',         diasAtras: 7, motivo: 'Saldo insuficiente na conta de origem.' },
                    { status: 'NAO_AUTORIZADO', diasAtras: 4, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },
            {
                clienteIdx: 2, nome: 'QA e Testes Jun', descricao: 'Testes automatizados e2e — sprint 4',
                valor: 4100.00, status: 'NAO_AUTORIZADO',
                criadoMeses: 0, criadoDia: 6, vencDias: 30,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 3, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },

            // VENCIDOS
            {
                clienteIdx: 1, nome: 'Licença Ferramentas Dev Jun', descricao: 'JetBrains All Products Pack — anual',
                valor: 3900.00, status: 'VENCIDO',
                criadoMeses: 0, criadoDia: 1, vencDias: -2,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 5, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },
            {
                clienteIdx: 4, nome: 'Implantação ERP Jun', descricao: 'Módulo contábil — vencido sem tentativa',
                valor: 8700.00, status: 'VENCIDO',
                criadoMeses: 0, criadoDia: 1, vencDias: -1,
                tentativas: [],
            },

            // CANCELADOS
            {
                clienteIdx: 5, nome: 'Workshop Cancelado Jun', descricao: 'Cancelado por agenda do cliente',
                valor: 1800.00, status: 'CANCELADO',
                criadoMeses: 0, criadoDia: 4, vencDias: 20,
                tentativas: [],
            },
            {
                clienteIdx: 6, nome: 'Projeto Beta Cancelado Jun', descricao: 'Escopo redefinido — novo contrato em aberto',
                valor: 28000.00, status: 'CANCELADO',
                criadoMeses: 0, criadoDia: 5, vencDias: 45,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 6, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },

            // AGUARDANDO
            {
                clienteIdx: 1, nome: 'Renovação Suporte Q3', descricao: 'Plano de suporte trimestral',
                valor: 6600.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 7, vencDias: 25,
                tentativas: [
                    { status: 'NAO_AUTORIZADO', diasAtras: 5, motivo: 'Tempo limite de 5 minutos excedido sem confirmação do banco.' },
                ],
            },
            {
                clienteIdx: 2, nome: 'Desenvolvimento Backend Jun', descricao: 'Sprint 4 — módulo de relatórios',
                valor: 9200.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 8, vencDias: 28,
                tentativas: [
                    { status: 'FALHA', diasAtras: 3, motivo: 'Saldo insuficiente na conta de origem.' },
                ],
            },
            {
                clienteIdx: 4, nome: 'Treinamento Power BI Jun', descricao: 'Visualização dados — turma 2',
                valor: 2800.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 9, vencDias: 15,
                tentativas: [
                    { status: 'FALHA',    diasAtras: 2, motivo: 'Banco temporariamente indisponível.' },
                    { status: 'PENDENTE', diasAtras: 0 },
                ],
            },
            {
                clienteIdx: 5, nome: 'Suporte N2 Junho',
                valor: 4800.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 10, vencDias: 22,
                tentativas: [],
            },
            {
                clienteIdx: 7, nome: 'Segurança da Informação Jun', descricao: 'Pentest e análise de vulnerabilidades',
                valor: 16500.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 11, vencDias: 30,
                tentativas: [],
            },
            {
                clienteIdx: 3, nome: 'Projeto CRM Jun', descricao: 'Novo módulo de conciliação bancária',
                valor: 28000.00, status: 'AGUARDANDO_PAGAMENTO',
                criadoMeses: 0, criadoDia: 12, vencDias: 45,
                tentativas: [],
            },
        ];

        for (const pag of pagamentos) {
            const pagId     = uuid();
            const criadoEm  = monthsAgo(pag.criadoMeses, pag.criadoDia ?? 10);
            const dataVenc  = daysFromDate(criadoEm, pag.vencDias);
            const valorPago = pag.valorPago ?? 0;

            await q.query(`
                INSERT INTO pagamentos
                    (id, usuario_id, cliente_id, nome, descricao, valor, valor_pago, status, data_vencimento, criado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                pagId, usuarioId, clientes[pag.clienteIdx].id,
                pag.nome, pag.descricao ?? null,
                pag.valor, valorPago, pag.status,
                dataVenc, criadoEm,
            ]);

            for (const t of pag.tentativas) {
                const tentId   = uuid();
                const tentData = daysAgo(t.diasAtras);
                await q.query(`
                    INSERT INTO tentativas_transacao
                        (id, pagamento_id, status, referencia_externa, motivo_falha, valor_tentativa, resposta_webhook, data_tentativa, criado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    tentId, pagId, t.status,
                    t.refExt ?? null,
                    t.motivo ?? null,
                    pag.valor,
                    t.refExt
                        ? JSON.stringify({ event: 'payment_intent/completed', paymentRequestId: t.refExt })
                        : null,
                    tentData,
                    tentData,
                ]);
            }
        }

        await q.commitTransaction();
    } catch (err) {
        await q.rollbackTransaction();
        throw err;
    } finally {
        await q.release();
    }
}