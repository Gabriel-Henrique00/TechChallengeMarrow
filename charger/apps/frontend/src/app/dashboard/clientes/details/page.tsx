"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/common/status-badge"
import { clientService } from "@/services/client.service"
import { paymentService } from "@/services/payment.service"
import {
    formatCurrency, formatDate, formatDocument, formatPhone,
} from "@/lib/utils"
import type { Client, Payment } from "@/types"
import {
    ArrowLeft, User, Mail, Phone, FileText,
    Calendar, TrendingUp, Clock, Eye, Plus,
} from "lucide-react"

function DetalheClienteContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const clienteId    = searchParams.get("id")

    const [client, setClient]                 = useState<Client | null>(null)
    const [clientPayments, setClientPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading]           = useState(true)
    const [hasError, setHasError]             = useState(false)

    useEffect(() => {
        if (!clienteId) { router.replace("/dashboard/clientes"); return }

        Promise.all([clientService.findById(clienteId), paymentService.findAll()])
            .then(([c, allPayments]) => {
                setClient(c)
                setClientPayments((allPayments ?? []).filter((p) => p.clienteId === c.id))
            })
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false))
    }, [clienteId, router])

    if (hasError) {
        return (
            <main className="flex flex-1 items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Cliente não encontrado.</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/dashboard/clientes">Voltar para clientes</Link>
                    </Button>
                </div>
            </main>
        )
    }

    const safePayments  = clientPayments ?? []
    const totalAmount   = safePayments.reduce((s, p) => s + p.valor, 0)
    const paidAmount    = safePayments.filter((p) => p.status === "PAGO").reduce((s, p) => s + p.valor, 0)
    const pendingAmount = safePayments.filter((p) => p.status === "AGUARDANDO_PAGAMENTO").reduce((s, p) => s + p.valor, 0)

    return (
        <>
            <AppHeader
                title={isLoading ? "Carregando..." : client?.nome ?? "Cliente"}
                subtitle="Detalhes do cliente"
            />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-5xl">
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link href="/dashboard/clientes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para clientes
                        </Link>
                    </Button>

                    {isLoading ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <Skeleton className="h-80 lg:col-span-1" />
                            <div className="space-y-4 lg:col-span-2">
                                <Skeleton className="h-32" />
                                <Skeleton className="h-64" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-8 w-8 text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <h2 className="text-xl font-semibold">{client?.nome}</h2>
                                    <p className="font-mono text-sm text-muted-foreground">
                                        {formatDocument(client?.documento ?? "")}
                                    </p>

                                    <Separator className="my-6" />

                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client?.email}</span>
                                        </div>
                                        {client?.telefone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatPhone(client.telefone)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                        Cliente desde {formatDate(client?.criadoEm ?? "")}
                      </span>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    <Button className="w-full" asChild>
                                        <Link href={`/dashboard/pagamentos/create?clienteId=${client?.id}`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Nova Cobrança
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <div className="space-y-6 lg:col-span-2">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-muted p-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Cobrado</p>
                                                    <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-success/10 p-2">
                                                    <TrendingUp className="h-4 w-4 text-success" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Recebido</p>
                                                    <p className="text-lg font-bold text-success">{formatCurrency(paidAmount)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-warning/10 p-2">
                                                    <Clock className="h-4 w-4 text-warning" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Pendente</p>
                                                    <p className="text-lg font-bold text-warning">{formatCurrency(pendingAmount)}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Histórico de Cobranças</CardTitle>
                                        <CardDescription>
                                            {safePayments.length} cobrança(s) registrada(s) para este cliente
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {safePayments.length === 0 ? (
                                            <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                                                <p className="text-muted-foreground">Nenhuma cobrança registrada</p>
                                                <Button variant="link" asChild className="mt-1">
                                                    <Link href={`/dashboard/pagamentos/create?clienteId=${client?.id}`}>
                                                        Criar primeira cobrança
                                                    </Link>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Nome</TableHead>
                                                        <TableHead>Valor</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                                                        <TableHead className="w-[50px]">
                                                            <span className="sr-only">Ações</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {safePayments.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell className="font-medium">{payment.nome}</TableCell>
                                                            <TableCell>{formatCurrency(payment.valor)}</TableCell>
                                                            <TableCell>
                                                                <StatusBadge status={payment.status} size="sm" />
                                                            </TableCell>
                                                            <TableCell className="hidden text-muted-foreground sm:table-cell">
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
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}

export default function DetalheClientePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <DetalheClienteContent />
        </Suspense>
    )
}