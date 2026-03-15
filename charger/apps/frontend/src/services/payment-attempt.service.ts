import { apiClient } from "@/lib/api-client"
import type { PaymentAttempt } from "@/types"

export const paymentAttemptService = {
    async create(pagamentoId: string): Promise<PaymentAttempt> {
        return apiClient.post<PaymentAttempt>(
            `/payments/${pagamentoId}/attempt`,
            {},
            false
        )
    },

    async findByPaymentId(pagamentoId: string): Promise<PaymentAttempt[]> {
        return apiClient.get<PaymentAttempt[]>(`/payments/${pagamentoId}/attempts`)
    },
}