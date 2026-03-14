"use client"

import Link from "next/link"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/common/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { DashboardSummary } from "@/types"
import { Eye, ArrowRight } from "lucide-react"

interface PaymentsTableProps {
    data: DashboardSummary | null
    isLoading: boolean
}

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
    const recentPayments = data?.pagamentos.slice(0, 5) ?? []

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Pagamentos Recentes</CardTitle>
                    <CardDescription>Últimas cobranças cadastradas no sistema</CardDescription>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/pagamentos">
                        Ver todos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                                <TableHead className="hidden sm:table-cell">Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                                <TableHead className="w-[50px]">
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhum pagamento cadastrado ainda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.nome}</TableCell>
                                        <TableCell className="hidden md:table-cell">{payment.nomeCliente}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {formatCurrency(payment.valor)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.status} size="sm" />
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                                            {formatDate(payment.criadoEm)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/dashboard/pagamentos/details?id=${payment.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Ver detalhes</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}