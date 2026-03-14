"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { dashboardService } from "@/services/dashboard.service"
import type { DashboardSummary } from "@/types"

export default function DashboardPage() {
    const [summary, setSummary]     = useState<DashboardSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        dashboardService
            .getSummary()
            .then(setSummary)
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <>
            <AppHeader title="Dashboard" subtitle="Visão geral das cobranças e recebíveis" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
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