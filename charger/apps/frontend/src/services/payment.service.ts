import { apiClient } from "@/lib/api-client"
import type { Payment, CreatePaymentPayload } from "@/types"

// tipo retornado pelo endpoint público (sem dados sensíveis)
export interface PublicPayment {
    id: string
    nome: string
    descricao: string | null
    valor: number
    status: string
    dataVencimento: string
    nomeCliente: string
}

export const paymentService = {
    async findAll(): Promise<Payment[]> {
        return apiClient.get<Payment[]>("/payments")
    },

    async findById(pagamentoId: string): Promise<Payment> {
        return apiClient.get<Payment>(`/payments/${pagamentoId}`)
    },

    // Sem autenticação — usado no checkout pelo cliente
    async findByIdPublico(pagamentoId: string): Promise<PublicPayment> {
        return apiClient.get<PublicPayment>(`/payments/public/${pagamentoId}`, false)
    },

    async create(payload: CreatePaymentPayload): Promise<Payment> {
        return apiClient.post<Payment>("/payments", payload)
    },
}