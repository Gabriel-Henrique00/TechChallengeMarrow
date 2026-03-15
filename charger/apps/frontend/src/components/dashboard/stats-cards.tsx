"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { TrendingUp, Clock, XCircle, Receipt, Ban, CalendarX } from "lucide-react"
import { type LucideIcon } from "lucide-react"

interface StatsCardsProps {
    data: DashboardSummary | null
    isLoading: boolean
}

interface CardDef {
    label:      string
    value:      string
    sub:        string
    icon:       LucideIcon
    iconBg:     string
    iconColor:  string
    valueColor: string
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }: CardDef) {
    return (
        <div className="rounded-xl border bg-card shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className={`rounded-md ${iconBg} p-2`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </div>
            <div className={`truncate text-2xl font-bold ${valueColor}`}>{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
    )
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card shadow-sm px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="mt-1.5 h-3 w-36" />
                    </div>
                ))}
            </div>
        )
    }

    const pagamentos = data?.pagamentos ?? []

    const paidCount         = pagamentos.filter((p) => p.status === "PAGO").length
    const pendingCount      = pagamentos.filter((p) => p.status === "AGUARDANDO_PAGAMENTO").length
    const unauthorizedCount = data?.totalNaoAutorizado ?? 0
    const cancelledCount    = data?.totalCancelado     ?? 0
    const expiredCount      = data?.totalVencido       ?? 0

    const unauthorizedTotal = pagamentos
        .filter((p) => p.status === "NAO_AUTORIZADO")
        .reduce((acc, p) => acc + p.valor, 0)

    const expiredTotal = pagamentos
        .filter((p) => p.status === "VENCIDO")
        .reduce((acc, p) => acc + p.valor, 0)

    const cancelledTotal = pagamentos
        .filter((p) => p.status === "CANCELADO")
        .reduce((acc, p) => acc + p.valor, 0)

    const cards: CardDef[] = [
        {
            label: "Total Recebido",
            value: formatCurrency(data?.totalRecebido ?? 0),
            sub:   `${paidCount} pagamento(s) confirmado(s)`,
            icon:  TrendingUp,
            iconBg: "bg-success/10", iconColor: "text-success", valueColor: "text-success",
        },
        {
            label: "Aguardando",
            value: formatCurrency(data?.totalAguardando ?? 0),
            sub:   `${pendingCount} cobrança(s) pendente(s)`,
            icon:  Clock,
            iconBg: "bg-warning/10", iconColor: "text-warning", valueColor: "text-foreground",
        },
        {
            label: "Total de Cobranças",
            value: String(data?.totalPagamentos ?? 0),
            sub:   "cobranças cadastradas",
            icon:  Receipt,
            iconBg: "bg-primary/10", iconColor: "text-primary", valueColor: "text-foreground",
        },
        {
            label: "Não Autorizados",
            value: formatCurrency(unauthorizedTotal),
            sub:   `${unauthorizedCount} pagamento(s) recusado(s)`,
            icon:  XCircle,
            iconBg: "bg-destructive/10", iconColor: "text-destructive", valueColor: "text-destructive",
        },
        {
            label: "Vencidos",
            value: formatCurrency(expiredTotal),
            sub:   `${expiredCount} cobrança(s) vencida(s)`,
            icon:  CalendarX,
            iconBg: "bg-orange-500/10", iconColor: "text-orange-500", valueColor: "text-orange-500",
        },
        {
            label: "Cancelados",
            value: formatCurrency(cancelledTotal),
            sub:   `${cancelledCount} cobrança(s) cancelada(s)`,
            icon:  Ban,
            iconBg: "bg-muted", iconColor: "text-muted-foreground", valueColor: "text-muted-foreground",
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
    )
}