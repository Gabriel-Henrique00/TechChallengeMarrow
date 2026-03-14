"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { TrendingUp, Clock, XCircle, Receipt } from "lucide-react"

interface StatsCardsProps {
    data: DashboardSummary | null
    isLoading: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
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

    const unauthorizedTotal =
        data?.pagamentos
            .filter((p) => p.status === "NAO_AUTORIZADO")
            .reduce((acc, p) => acc + p.valor, 0) ?? 0

    const paidCount    = data?.pagamentos.filter((p) => p.status === "PAGO").length ?? 0
    const pendingCount = data?.pagamentos.filter((p) => p.status === "AGUARDANDO_PAGAMENTO").length ?? 0

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    <div className="text-2xl font-bold">{formatCurrency(data?.totalRecebido ?? 0)}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {paidCount} pagamentos confirmados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Aguardando Pagamento
                    </CardTitle>
                    <div className="rounded-md bg-warning/10 p-2">
                        <Clock className="h-4 w-4 text-warning" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data?.totalAguardando ?? 0)}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {pendingCount} cobranças pendentes
                    </p>
                </CardContent>
            </Card>

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
                    <div className="text-2xl font-bold">{formatCurrency(unauthorizedTotal)}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {data?.totalNaoAutorizado ?? 0} pagamentos recusados
                    </p>
                </CardContent>
            </Card>

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
                    <div className="text-2xl font-bold">{data?.totalPagamentos ?? 0}</div>
                    <p className="mt-1 text-xs text-muted-foreground">cobranças cadastradas</p>
                </CardContent>
            </Card>
        </div>
    )
}