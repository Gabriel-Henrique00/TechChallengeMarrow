"use client"

import { useState, useEffect, useRef } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { dashboardService } from "@/services/dashboard.service"
import { useNotifications } from "@/contexts/notification-context"
import type { DashboardSummary } from "@/types"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const POLLING_INTERVAL_MS = 30 * 1000

export default function DashboardPage() {
    const [summary, setSummary]     = useState<DashboardSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError]         = useState<string | null>(null)
    const { addNotification }       = useNotifications()

    const previousStatusRef = useRef<Map<string, string>>(new Map())

    const checkForStatusChanges = (newData: DashboardSummary) => {
        const prevMap = previousStatusRef.current

        for (const payment of newData.pagamentos) {
            const prevStatus = prevMap.get(payment.id)

            // Primeira carga — só salva, não notifica
            if (!prevStatus) {
                prevMap.set(payment.id, payment.status)
                continue
            }

            // Mudou de status — notifica
            if (prevStatus !== payment.status) {
                prevMap.set(payment.id, payment.status)

                if (payment.status === "PAGO") {
                    addNotification({
                        type:      "success",
                        title:     "Pagamento Confirmado",
                        message:   `"${payment.nome}" de ${payment.nomeCliente} foi pago com sucesso.`,
                        paymentId: payment.id,
                    })
                } else if (payment.status === "NAO_AUTORIZADO") {
                    addNotification({
                        type:      "error",
                        title:     "Pagamento Não Autorizado",
                        message:   `"${payment.nome}" de ${payment.nomeCliente} foi recusado.`,
                        paymentId: payment.id,
                    })
                } else if (payment.status === "CANCELADO") {
                    addNotification({
                        type:      "warning",
                        title:     "Pagamento Cancelado",
                        message:   `"${payment.nome}" de ${payment.nomeCliente} foi cancelado.`,
                        paymentId: payment.id,
                    })
                } else if (payment.status === "VENCIDO") {
                    addNotification({
                        type:      "warning",
                        title:     "Pagamento Vencido",
                        message:   `"${payment.nome}" de ${payment.nomeCliente} venceu sem pagamento.`,
                        paymentId: payment.id,
                    })
                }
            }
        }
    }

    const loadData = (showLoading = true) => {
        if (showLoading) setIsLoading(true)
        setError(null)
        dashboardService
            .getSummary()
            .then((data) => {
                if (data) {
                    checkForStatusChanges(data)
                    setSummary(data)
                }
            })
            .catch((err) => {
                console.error(err)
                if (showLoading) setError(err?.message ?? "Erro ao carregar dados do dashboard.")
            })
            .finally(() => { if (showLoading) setIsLoading(false) })
    }

    useEffect(() => {
        loadData(true)

        // Polling silencioso a cada 30 segundos para detectar mudanças
        const interval = setInterval(() => loadData(false), POLLING_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

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
                                onClick={() => loadData(true)}
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