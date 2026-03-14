// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
    id: string
    nome: string
    email: string
    nomeEmpresa: string
}

export interface AuthResponse {
    accessToken: string
    usuario: AuthUser
}

export interface LoginPayload {
    email: string
    senha: string
}

export interface RegisterPayload {
    nome: string
    email: string
    senha: string
    nomeEmpresa: string
    cnpj: string
}

// ─── Client ──────────────────────────────────────────────────────────────────

export interface Client {
    id: string
    nome: string
    email: string
    telefone: string | null
    documento: string
    criadoEm: string
}

export interface CreateClientPayload {
    nome: string
    email: string
    telefone?: string
    documento: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
    | "AGUARDANDO_PAGAMENTO"
    | "PAGO"
    | "NAO_AUTORIZADO"
    | "CANCELADO"
    | "VENCIDO"

export interface Payment {
    id: string
    clienteId: string
    nomeCliente: string
    nome: string
    descricao: string | null
    valor: number
    valorPago: number
    status: PaymentStatus
    dataVencimento: string
    criadoEm: string
}

export interface CreatePaymentPayload {
    clienteId: string
    nome: string
    descricao?: string
    valor: number
    dataVencimento: string
}

// ─── Payment Attempt ─────────────────────────────────────────────────────────

export type AttemptStatus = "PENDENTE" | "SUCESSO" | "FALHA" | "NAO_AUTORIZADO"

export interface PaymentAttempt {
    id: string
    pagamentoId: string
    status: AttemptStatus
    idBanco: string
    nomeBanco: string
    referenciaExterna: string | null
    motivoFalha: string | null
    valorTentativa: number
    paymentUrl: string | null
    dataTentativa: string
    criadoEm: string
}

export interface CreateAttemptPayload {
    idBanco: string
    nomeBanco: string
}

// ─── Bank ────────────────────────────────────────────────────────────────────

export interface Bank {
    id: string
    name: string
    code: string
    logo?: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardPaymentItem {
    id: string
    nome: string
    nomeCliente: string
    status: PaymentStatus
    valor: number
    criadoEm: string
}

export interface DashboardSummary {
    totalPagamentos: number
    totalRecebido: number
    totalAguardando: number
    totalNaoAutorizado: number
    totalCancelado: number
    totalVencido: number
    pagamentos: DashboardPaymentItem[]
}