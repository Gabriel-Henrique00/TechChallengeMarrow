"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { StatusChart } from "@/components/dashboard/status-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { dashboardService } from "@/services/dashboard.service"
import { useNotifications } from "@/contexts/notification-context"
import type { DashboardSummary } from "@/types"
import { AlertCircle, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const POLLING_INTERVAL_MS = 30 * 1000

function gerarOpcoesMeses() {
    const opcoes: { value: string; label: string }[] = [
        { value: "all", label: "Todos os períodos" },
    ]
    const hoje = new Date()
    for (let i = 0; i < 12; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
        opcoes.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return opcoes
}

export default function DashboardPage() {
    const [summary, setSummary]       = useState<DashboardSummary | null>(null)
    const [isLoading, setIsLoading]   = useState(true)
    const [error, setError]           = useState<string | null>(null)
    const [periodoFiltro, setPeriodoFiltro] = useState("all")
    const { addNotification }         = useNotifications()
    const previousStatusRef           = useRef<Map<string, string>>(new Map())
    const opcoesMeses                 = useMemo(() => gerarOpcoesMeses(), [])

    const checkForStatusChanges = (newData: DashboardSummary) => {
        const prevMap = previousStatusRef.current
        for (const payment of newData.pagamentos) {
            const prevStatus = prevMap.get(payment.id)
            if (!prevStatus) { prevMap.set(payment.id, payment.status); continue }
            if (prevStatus !== payment.status) {
                prevMap.set(payment.id, payment.status)
                if (payment.status === "PAGO") {
                    addNotification({ type: "success", title: "Pagamento Confirmado", message: `"${payment.nome}" de ${payment.nomeCliente} foi pago com sucesso.`, paymentId: payment.id })
                } else if (payment.status === "NAO_AUTORIZADO") {
                    addNotification({ type: "error", title: "Pagamento Não Autorizado", message: `"${payment.nome}" de ${payment.nomeCliente} foi recusado.`, paymentId: payment.id })
                } else if (payment.status === "CANCELADO") {
                    addNotification({ type: "warning", title: "Pagamento Cancelado", message: `"${payment.nome}" de ${payment.nomeCliente} foi cancelado.`, paymentId: payment.id })
                } else if (payment.status === "VENCIDO") {
                    addNotification({ type: "warning", title: "Pagamento Vencido", message: `"${payment.nome}" de ${payment.nomeCliente} venceu sem pagamento.`, paymentId: payment.id })
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
                if (data) { checkForStatusChanges(data); setSummary(data) }
            })
            .catch((err) => {
                console.error(err)
                if (showLoading) setError(err?.message ?? "Erro ao carregar dados do dashboard.")
            })
            .finally(() => { if (showLoading) setIsLoading(false) })
    }

    useEffect(() => {
        loadData(true)
        const interval = setInterval(() => loadData(false), POLLING_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    const summaryFiltrado = useMemo((): DashboardSummary | null => {
        if (!summary || periodoFiltro === "all") return summary

        const pagamentosFiltrados = summary.pagamentos.filter((p) => {
            const d   = new Date(p.criadoEm)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
            return key === periodoFiltro
        })

        const totalRecebido    = pagamentosFiltrados.filter((p) => p.status === "PAGO").reduce((a, p) => a + p.valor, 0)
        const totalAguardando  = pagamentosFiltrados.filter((p) => p.status === "AGUARDANDO_PAGAMENTO").reduce((a, p) => a + p.valor, 0)

        return {
            totalPagamentos:    pagamentosFiltrados.length,
            totalRecebido,
            totalAguardando,
            totalNaoAutorizado: pagamentosFiltrados.filter((p) => p.status === "NAO_AUTORIZADO").length,
            totalCancelado:     pagamentosFiltrados.filter((p) => p.status === "CANCELADO").length,
            totalVencido:       pagamentosFiltrados.filter((p) => p.status === "VENCIDO").length,
            pagamentos:         pagamentosFiltrados,
        }
    }, [summary, periodoFiltro])

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

                    {/* Filtro de período */}
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Filtrar por período" />
                            </SelectTrigger>
                            <SelectContent>
                                {opcoesMeses.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {periodoFiltro !== "all" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPeriodoFiltro("all")}
                                className="text-muted-foreground"
                            >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Limpar filtro
                            </Button>
                        )}
                    </div>

                    <StatsCards data={summaryFiltrado} isLoading={isLoading} />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <RevenueChart data={summaryFiltrado} isLoading={isLoading} />
                        <StatusChart  data={summaryFiltrado} isLoading={isLoading} />
                    </div>
                    <PaymentsTable data={summaryFiltrado} isLoading={isLoading} />
                </div>
            </main>
        </>
    )
}