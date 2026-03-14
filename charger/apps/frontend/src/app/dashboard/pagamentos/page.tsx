"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/common/status-badge"
import { paymentService } from "@/services/payment.service"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Payment } from "@/types"
import { Eye, Plus, Search, Filter } from "lucide-react"

export default function PagamentosPage() {
    const [payments, setPayments]         = useState<Payment[]>([])
    const [isLoading, setIsLoading]       = useState(true)
    const [search, setSearch]             = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    useEffect(() => {
        paymentService.findAll().then(setPayments).catch(console.error).finally(() => setIsLoading(false))
    }, [])

    const filtered = payments.filter((p) => {
        const matchSearch =
            p.nome.toLowerCase().includes(search.toLowerCase())         ||
            p.nomeCliente.toLowerCase().includes(search.toLowerCase())  ||
            p.id.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === "all" || p.status === statusFilter
        return matchSearch && matchStatus
    })

    return (
        <>
            <AppHeader title="Pagamentos" subtitle="Gerencie todas as cobranças do sistema" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1 sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, cliente ou ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os status</SelectItem>
                                        <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando</SelectItem>
                                        <SelectItem value="PAGO">Pago</SelectItem>
                                        <SelectItem value="NAO_AUTORIZADO">Não autorizado</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                        <SelectItem value="VENCIDO">Vencido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/pagamentos/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Pagamento
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Pagamentos</CardTitle>
                            <CardDescription>
                                {isLoading ? "Carregando..." : `${filtered.length} pagamento(s) encontrado(s)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="h-14 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead className="hidden md:table-cell">Cliente</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden lg:table-cell">Vencimento</TableHead>
                                            <TableHead className="w-[50px]">
                                                <span className="sr-only">Ações</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    Nenhum pagamento encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{payment.nome}</p>
                                                            <p className="text-sm text-muted-foreground line-clamp-1 md:hidden">
                                                                {payment.nomeCliente}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">{payment.nomeCliente}</TableCell>
                                                    <TableCell className="font-medium">{formatCurrency(payment.valor)}</TableCell>
                                                    <TableCell><StatusBadge status={payment.status} size="sm" /></TableCell>
                                                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                                                        {formatDate(payment.dataVencimento)}
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
                </div>
            </main>
        </>
    )
}