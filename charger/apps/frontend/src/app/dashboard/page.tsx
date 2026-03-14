"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { dashboardService } from "@/services/dashboard.service"
import type { DashboardSummary } from "@/types"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
    const [summary, setSummary]     = useState<DashboardSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError]         = useState<string | null>(null)

    const loadData = () => {
        setIsLoading(true)
        setError(null)
        dashboardService
            .getSummary()
            .then((data) => setSummary(data ?? null))
            .catch((err) => {
                console.error(err)
                setError(err?.message ?? "Erro ao carregar dados do dashboard.")
            })
            .finally(() => setIsLoading(false))
    }

    useEffect(() => { loadData() }, [])

    return (
        <>
            <AppHeader title="Dashboard" subtitle="Visão geral das cobranças e recebíveis" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {error && (
                        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadData}
                                className="ml-4 text-destructive hover:text-destructive"
                            >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Tentar novamente
                            </Button>
                        </div>
                    )}

                    <StatsCards data={summary} isLoading={isLoading} />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <RevenueChart data={summary} isLoading={isLoading} />
                        <StatusChart  data={summary} isLoading={isLoading} />
                    </div>
                    <PaymentsTable data={summary} isLoading={isLoading} />
                </div>
            </main>
        </>
    )
}