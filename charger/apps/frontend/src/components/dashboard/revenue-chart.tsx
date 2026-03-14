"use client"

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary } from "@/types"

interface RevenueChartProps {
    data: DashboardSummary | null
    isLoading: boolean
}

function buildMonthlyData(data: DashboardSummary) {
    const map = new Map<string, { month: string; received: number; pending: number }>()

    for (const payment of data.pagamentos) {
        const date  = new Date(payment.criadoEm)
        const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

        if (!map.has(key)) map.set(key, { month: label, received: 0, pending: 0 })

        const entry = map.get(key)!
        if (payment.status === "PAGO") entry.received += payment.valor
        else if (payment.status === "AGUARDANDO_PAGAMENTO") entry.pending += payment.valor
    }

    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([, v]) => v)
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartData = data ? buildMonthlyData(data) : []

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Recebimentos por Mês</CardTitle>
                <CardDescription>Comparativo entre valores recebidos e pendentes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                                axisLine={{ stroke: "var(--color-border)" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null
                                    return (
                                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                                            <p className="mb-2 font-medium text-foreground">{label}</p>
                                            {payload.map((entry, i) => (
                                                <p key={i} className="text-sm" style={{ color: entry.color }}>
                                                    {entry.name}: {formatCurrency(entry.value as number)}
                                                </p>
                                            ))}
                                        </div>
                                    )
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: "20px" }}
                                formatter={(v) => <span className="text-sm text-muted-foreground">{v}</span>}
                            />
                            <Bar dataKey="received" name="Recebido" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending"  name="Pendente" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}