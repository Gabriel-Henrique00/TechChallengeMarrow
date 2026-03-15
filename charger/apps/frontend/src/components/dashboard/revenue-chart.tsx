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

interface MonthEntry {
    month: string
    pago: number
    aguardando: number
    naoAutorizado: number
    vencido: number
    cancelado: number
}

function buildMonthlyData(data: DashboardSummary): MonthEntry[] {
    const map = new Map<string, MonthEntry>()

    for (const payment of data.pagamentos) {
        const date  = new Date(payment.criadoEm)
        const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

        if (!map.has(key)) {
            map.set(key, {
                month:         label,
                pago:          0,
                aguardando:    0,
                naoAutorizado: 0,
                vencido:       0,
                cancelado:     0,
            })
        }

        const entry = map.get(key)!

        switch (payment.status) {
            case "PAGO":                 entry.pago          += payment.valor; break
            case "AGUARDANDO_PAGAMENTO": entry.aguardando    += payment.valor; break
            case "NAO_AUTORIZADO":       entry.naoAutorizado += payment.valor; break
            case "VENCIDO":              entry.vencido       += payment.valor; break
            case "CANCELADO":            entry.cancelado     += payment.valor; break
        }
    }

    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([, v]) => v)
}

const BAR_CONFIG = [
    { key: "pago",          name: "Pago",           color: "var(--color-chart-2)" },
    { key: "aguardando",    name: "Aguardando",      color: "var(--color-chart-4)" },
    { key: "naoAutorizado", name: "Não Autorizado",  color: "var(--color-chart-5)" },
    { key: "vencido",       name: "Vencido",         color: "var(--color-chart-3)" },
    { key: "cancelado",     name: "Cancelado",       color: "var(--color-chart-1)" },
]

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
    if (isLoading) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent><Skeleton className="h-[320px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartData = data ? buildMonthlyData(data) : []

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Valores por Mês</CardTitle>
                <CardDescription>
                    Distribuição dos valores por status em cada mês
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--color-border)"
                                vertical={false}
                            />
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
                                tickFormatter={(v) =>
                                    v >= 1000
                                        ? `R$ ${(v / 1000).toFixed(0)}k`
                                        : `R$ ${v}`
                                }
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null
                                    const nonZero = payload.filter((e) => (e.value as number) > 0)
                                    if (!nonZero.length) return null
                                    return (
                                        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                                            <p className="mb-2 font-medium text-foreground">{label}</p>
                                            {nonZero.map((entry, i) => (
                                                <p key={i} className="text-sm" style={{ color: entry.color }}>
                                                    {entry.name}: {formatCurrency(entry.value as number)}
                                                </p>
                                            ))}
                                        </div>
                                    )
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: "16px" }}
                                formatter={(v) => (
                                    <span className="text-xs text-muted-foreground">{v}</span>
                                )}
                            />
                            {BAR_CONFIG.map((bar) => (
                                <Bar
                                    key={bar.key}
                                    dataKey={bar.key}
                                    name={bar.name}
                                    fill={bar.color}
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={20}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}