"use client"

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts"
import type { DashboardSummary } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface StatusChartProps {
    data: DashboardSummary | null
    isLoading: boolean
}

const STATUS_CONFIG = [
    { key: "PAGO",                 label: "Pago",           color: "var(--color-chart-2)" },
    { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando",     color: "var(--color-chart-4)" },
    { key: "NAO_AUTORIZADO",       label: "Não autorizado", color: "var(--color-chart-5)" },
    { key: "VENCIDO",              label: "Vencido",        color: "var(--color-chart-3)" },
    { key: "CANCELADO",            label: "Cancelado",      color: "var(--color-chart-1)" },
]

function buildStatusData(data: DashboardSummary) {
    const counts = new Map<string, { count: number; total: number }>()

    for (const p of data.pagamentos) {
        const current = counts.get(p.status) ?? { count: 0, total: 0 }
        counts.set(p.status, {
            count: current.count + 1,
            total: current.total + p.valor,
        })
    }

    return STATUS_CONFIG.map(({ key, label, color }) => {
        const entry = counts.get(key) ?? { count: 0, total: 0 }
        return { name: label, value: entry.count, total: entry.total, fill: color }
    })
}

export function StatusChart({ data, isLoading }: StatusChartProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent><Skeleton className="h-[260px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartData = data ? buildStatusData(data) : STATUS_CONFIG.map(({ label, color }) => ({
        name: label, value: 0, total: 0, fill: color,
    }))

    const pieData = chartData.filter((d) => d.value > 0)
    const total   = chartData.reduce((a, d) => a + d.value, 0)

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Status dos Pagamentos</CardTitle>
                <CardDescription>Distribuição por situação atual</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {/* Donut menor com cy mais baixo para não cortar */}
                <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <Pie
                                data={pieData.length > 0 ? pieData : [{ name: "Sem dados", value: 1, total: 0, fill: "var(--color-border)" }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={48}
                                outerRadius={72}
                                paddingAngle={pieData.length > 1 ? 3 : 0}
                                dataKey="value"
                                nameKey="name"
                                strokeWidth={0}
                            >
                                {(pieData.length > 0 ? pieData : [{ fill: "var(--color-border)" }]).map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null
                                    const d = payload[0].payload
                                    if (d.name === "Sem dados") return null
                                    return (
                                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                                            <p className="mb-1 font-medium text-foreground">{d.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Quantidade: <span className="font-medium text-foreground">{d.value}</span>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Valor: <span className="font-medium text-foreground">{formatCurrency(d.total)}</span>
                                            </p>
                                        </div>
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legenda manual — substitui a do recharts que causava corte */}
                <div className="mt-3 space-y-2">
                    {chartData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                    style={{ background: d.fill }}
                                />
                                <span className="truncate text-muted-foreground">{d.name}</span>
                            </div>
                            <div className="ml-3 flex items-center gap-2 flex-shrink-0">
                                <span className="font-medium text-foreground tabular-nums">
                                    {d.value}
                                </span>
                                {total > 0 && (
                                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                                        {((d.value / total) * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}