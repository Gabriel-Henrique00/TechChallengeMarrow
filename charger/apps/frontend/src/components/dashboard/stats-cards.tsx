"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { TrendingUp, Clock, XCircle, Receipt, Ban, CalendarX } from "lucide-react"

interface StatsCardsProps {
    data: DashboardSummary | null
    isLoading: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="mt-2 h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const pagamentos = data?.pagamentos ?? []

    const paidCount         = pagamentos.filter((p) => p.status === "PAGO").length
    const pendingCount      = pagamentos.filter((p) => p.status === "AGUARDANDO_PAGAMENTO").length
    const unauthorizedCount = data?.totalNaoAutorizado ?? 0
    const cancelledCount    = data?.totalCancelado     ?? 0
    const expiredCount      = data?.totalVencido        ?? 0

    const unauthorizedTotal = pagamentos
        .filter((p) => p.status === "NAO_AUTORIZADO")
        .reduce((acc, p) => acc + p.valor, 0)

    const expiredTotal = pagamentos
        .filter((p) => p.status === "VENCIDO")
        .reduce((acc, p) => acc + p.valor, 0)

    const cancelledTotal = pagamentos
        .filter((p) => p.status === "CANCELADO")
        .reduce((acc, p) => acc + p.valor, 0)

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Total Recebido */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Recebido
                    </CardTitle>
                    <div className="rounded-md bg-success/10 p-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-success">
                        {formatCurrency(data?.totalRecebido ?? 0)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {paidCount} pagamento(s) confirmado(s)
                    </p>
                </CardContent>
            </Card>

            {/* Aguardando */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Aguardando
                    </CardTitle>
                    <div className="rounded-md bg-warning/10 p-2">
                        <Clock className="h-4 w-4 text-warning" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(data?.totalAguardando ?? 0)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {pendingCount} cobrança(s) pendente(s)
                    </p>
                </CardContent>
            </Card>

            {/* Não Autorizados */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Não Autorizados
                    </CardTitle>
                    <div className="rounded-md bg-destructive/10 p-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                        {formatCurrency(unauthorizedTotal)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {unauthorizedCount} pagamento(s) recusado(s)
                    </p>
                </CardContent>
            </Card>

            {/* Vencidos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Vencidos
                    </CardTitle>
                    <div className="rounded-md bg-orange-500/10 p-2">
                        <CalendarX className="h-4 w-4 text-orange-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                        {formatCurrency(expiredTotal)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {expiredCount} cobrança(s) vencida(s)
                    </p>
                </CardContent>
            </Card>

            {/* Cancelados */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Cancelados
                    </CardTitle>
                    <div className="rounded-md bg-muted p-2">
                        <Ban className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-muted-foreground">
                        {formatCurrency(cancelledTotal)}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {cancelledCount} cobrança(s) cancelada(s)
                    </p>
                </CardContent>
            </Card>

            {/* Total de Cobranças */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Cobranças
                    </CardTitle>
                    <div className="rounded-md bg-primary/10 p-2">
                        <Receipt className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data?.totalPagamentos ?? 0}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        cobranças cadastradas
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}