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
import { Skeleton } from "@/components/ui/skeleton"
import { clientService } from "@/services/client.service"
import { paymentService } from "@/services/payment.service"
import { formatDate, formatCurrency, formatDocument } from "@/lib/utils"
import type { Client, Payment } from "@/types"
import { Eye, Plus, Search, User } from "lucide-react"

export default function ClientesPage() {
    const [clients, setClients]     = useState<Client[]>([])
    const [payments, setPayments]   = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch]       = useState("")

    useEffect(() => {
        Promise.all([clientService.findAll(), paymentService.findAll()])
            .then(([c, p]) => { setClients(c); setPayments(p) })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const filtered = clients.filter(
        (c) =>
            c.nome.toLowerCase().includes(search.toLowerCase())  ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.documento.includes(search.replace(/\D/g, ""))
    )

    const getClientStats = (clienteId: string) => {
        const cp    = payments.filter((p) => p.clienteId === clienteId)
        const total = cp.reduce((s, p) => s + p.valor, 0)
        return { total, count: cp.length }
    }

    return (
        <>
            <AppHeader title="Clientes" subtitle="Gerencie os clientes cadastrados no sistema" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, e-mail ou documento..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button asChild>
                            <Link href="/dashboard/clientes/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Cliente
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Clientes</CardTitle>
                            <CardDescription>
                                {isLoading ? "Carregando..." : `${filtered.length} cliente(s) cadastrado(s)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-14 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead className="hidden md:table-cell">Documento</TableHead>
                                            <TableHead className="hidden sm:table-cell">Cobranças</TableHead>
                                            <TableHead className="hidden lg:table-cell">Total Cobrado</TableHead>
                                            <TableHead className="hidden xl:table-cell">Cadastro</TableHead>
                                            <TableHead className="w-[50px]">
                                                <span className="sr-only">Ações</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    Nenhum cliente encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filtered.map((client) => {
                                                const stats = getClientStats(client.id)
                                                return (
                                                    <TableRow key={client.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                                                    <User className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{client.nome}</p>
                                                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden font-mono text-sm md:table-cell">
                                                            {formatDocument(client.documento)}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium">
                                {stats.count}
                              </span>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            {formatCurrency(stats.total)}
                                                        </TableCell>
                                                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                                                            {formatDate(client.criadoEm)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link href={`/dashboard/clientes/details?id=${client.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                    <span className="sr-only">Ver detalhes</span>
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
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