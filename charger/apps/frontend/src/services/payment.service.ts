import { apiClient } from "@/lib/api-client"
import type { Payment, CreatePaymentPayload } from "@/types"

export const paymentService = {
    async findAll(): Promise<Payment[]> {
        return apiClient.get<Payment[]>("/payments")
    },

    async findById(pagamentoId: string): Promise<Payment> {
        return apiClient.get<Payment>(`/payments/${pagamentoId}`)
    },

    async create(payload: CreatePaymentPayload): Promise<Payment> {
        return apiClient.post<Payment>("/payments", payload)
    },
}