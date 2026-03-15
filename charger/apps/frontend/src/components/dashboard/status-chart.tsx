"use client"

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from "recharts"
import type { DashboardSummary } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface StatusChartProps {
    data: DashboardSummary | null
    isLoading: boolean
}


const STATUS_CONFIG = [
    { key: "PAGO",                 label: "Pago",          color: "var(--color-chart-2)" },
    { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando",    color: "var(--color-chart-4)" },
    { key: "NAO_AUTORIZADO",       label: "Não Autorizado",color: "var(--color-chart-5)" },
    { key: "VENCIDO",              label: "Vencido",       color: "var(--color-chart-3)" },
    { key: "CANCELADO",            label: "Cancelado",     color: "var(--color-chart-1)" },
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
        return {
            name:  label,
            value: entry.count,
            total: entry.total,
            fill:  color,
        }
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
                <CardContent><Skeleton className="h-[320px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartData = data ? buildStatusData(data) : STATUS_CONFIG.map(({ label, color }) => ({
        name: label, value: 0, total: 0, fill: color,
    }))

    // Pie só renderiza fatias > 0, mas legenda sempre mostra todos
    const pieData = chartData.filter((d) => d.value > 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status dos Pagamentos</CardTitle>
                <CardDescription>Distribuição por situação atual</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData.length > 0 ? pieData : [{ name: "Sem dados", value: 1, total: 0, fill: "var(--color-border)" }]}
                                cx="50%"
                                cy="42%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={pieData.length > 1 ? 3 : 0}
                                dataKey="value"
                                nameKey="name"
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

                            {/* Legenda sempre mostra todos os status */}
                            <Legend
                                layout="vertical"
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ paddingTop: "12px" }}
                                payload={chartData.map((d) => ({
                                    value: `${d.name} (${d.value})`,
                                    color: d.fill,
                                    type:  "circle" as const,
                                }))}
                                formatter={(v) => (
                                    <span className="text-xs text-muted-foreground">{v}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}