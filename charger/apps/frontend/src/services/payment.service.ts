import { apiClient } from "@/lib/api-client"
import type { Payment, CreatePaymentPayload } from "@/types"

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

    async findByIdPublico(pagamentoId: string): Promise<PublicPayment> {
        return apiClient.get<PublicPayment>(`/payments/public/${pagamentoId}`, false)
    },

    async create(payload: CreatePaymentPayload): Promise<Payment> {
        return apiClient.post<Payment>("/payments", payload)
    },

    async cancel(pagamentoId: string): Promise<Payment> {
        return apiClient.patch<Payment>(`/payments/${pagamentoId}/cancel`, {})
    },
}