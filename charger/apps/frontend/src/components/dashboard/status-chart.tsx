"use client"

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import type { DashboardSummary } from "@/types"

interface StatusChartProps {
    data: DashboardSummary | null
    isLoading: boolean
}

const STATUS_LABELS: Record<string, string> = {
    PAGO:                 "Pago",
    AGUARDANDO_PAGAMENTO: "Aguardando",
    NAO_AUTORIZADO:       "Não Autorizado",
    CANCELADO:            "Cancelado",
    VENCIDO:              "Vencido",
}

const STATUS_COLORS: Record<string, string> = {
    PAGO:                 "var(--color-chart-2)",
    AGUARDANDO_PAGAMENTO: "var(--color-chart-4)",
    NAO_AUTORIZADO:       "var(--color-chart-5)",
    CANCELADO:            "var(--color-chart-3)",
    VENCIDO:              "var(--color-chart-1)",
}

function buildStatusData(data: DashboardSummary) {
    const counts = new Map<string, number>()
    for (const p of data.pagamentos) {
        counts.set(p.status, (counts.get(p.status) ?? 0) + 1)
    }
    return Array.from(counts.entries())
        .filter(([, v]) => v > 0)
        .map(([status, value]) => ({
            name:  STATUS_LABELS[status] ?? status,
            value,
            fill:  STATUS_COLORS[status] ?? "var(--color-chart-1)",
        }))
}

export function StatusChart({ data, isLoading }: StatusChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartData = data ? buildStatusData(data) : []

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status dos Pagamentos</CardTitle>
                <CardDescription>Distribuição por situação atual</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                formatter={(v) => <span className="text-sm text-muted-foreground">{v}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}