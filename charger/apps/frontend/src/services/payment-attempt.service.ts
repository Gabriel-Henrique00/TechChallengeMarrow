import { apiClient } from "@/lib/api-client"
import type { Bank, CreateAttemptPayload, PaymentAttempt } from "@/types"

export const paymentAttemptService = {
    async getAvailableBanks(): Promise<Bank[]> {
        return apiClient.get<Bank[]>("/payments/banks")
    },

    async create(pagamentoId: string, payload: CreateAttemptPayload): Promise<PaymentAttempt> {
        return apiClient.post<PaymentAttempt>(
            `/payments/${pagamentoId}/attempt`,
            payload
        )
    },

    async findByPaymentId(pagamentoId: string): Promise<PaymentAttempt[]> {
        return apiClient.get<PaymentAttempt[]>(`/payments/${pagamentoId}/attempts`)
    },
}