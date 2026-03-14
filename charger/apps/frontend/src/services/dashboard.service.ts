import { apiClient } from "@/lib/api-client"
import type { DashboardSummary } from "@/types"

export const dashboardService = {
    async getSummary(): Promise<DashboardSummary> {
        return apiClient.get<DashboardSummary>("/dashboard/summary")
    },
}