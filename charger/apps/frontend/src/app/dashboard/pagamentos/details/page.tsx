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
import { paymentService } from "@/services/payment.service"
import { paymentAttemptService } from "@/services/payment-attempt.service"
import { clientService } from "@/services/client.service"
import {
    formatCurrency, formatDate, formatDateTime, formatDocument, formatPhone,
} from "@/lib/utils"
import type { Payment, PaymentAttempt, Client } from "@/types"
import {
    ArrowLeft, Copy, ExternalLink, User, Mail, Phone,
    FileText, Calendar, CreditCard, RefreshCw,
} from "lucide-react"

const CINCO_MINUTOS_MS = 10* 60 * 1000
const STATUS_COM_NOVA_TENTATIVA = ["AGUARDANDO_PAGAMENTO", "NAO_AUTORIZADO"]

function DetalhePagamentoContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const pagamentoId  = searchParams.get("id")

    const [payment, setPayment]         = useState<Payment | null>(null)
    const [attempts, setAttempts]       = useState<PaymentAttempt[]>([])
    const [client, setClient]           = useState<Client | null>(null)
    const [isLoading, setIsLoading]     = useState(true)
    const [hasError, setHasError]       = useState(false)
    const [copiedLink, setCopiedLink]   = useState(false)

    useEffect(() => {
        if (!pagamentoId) { router.replace("/dashboard/pagamentos"); return }

        paymentService.findById(pagamentoId)
            .then(async (p) => {
                setPayment(p)
                const [att, cli] = await Promise.all([
                    paymentAttemptService.findByPaymentId(pagamentoId),
                    clientService.findById(p.clienteId),
                ])
                setAttempts(att ?? [])
                setClient(cli)
            })
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false))
    }, [pagamentoId, router])

    if (hasError) {
        return (
            <main className="flex flex-1 items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-muted-foreground">Pagamento não encontrado.</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/dashboard/pagamentos">Voltar para pagamentos</Link>
                    </Button>
                </div>
            </main>
        )
    }

    const safeAttempts = attempts ?? []
    const isPaid       = payment?.status === "PAGO"

    const podeNovaTentativa =
        payment !== null &&
        STATUS_COM_NOVA_TENTATIVA.includes(payment.status) &&
        new Date() < new Date(payment.dataVencimento)

    const temTentativaPendente = safeAttempts.some((a) => {
        if (a.status !== "PENDENTE") return false
        const idadeMs = Date.now() - new Date(a.criadoEm).getTime()
        return idadeMs < CINCO_MINUTOS_MS
    })

    const checkoutUrl = typeof window !== "undefined"
        ? `${window.location.origin}/checkout?id=${pagamentoId}`
        : `/checkout?id=${pagamentoId}`

    const handleCopyLink = () => {
        navigator.clipboard.writeText(checkoutUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    return (
        <>
            <AppHeader
                title={isLoading ? "Carregando..." : payment?.nome ?? "Pagamento"}
                subtitle={payment?.descricao ?? undefined}
            />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-4xl">
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link href="/dashboard/pagamentos">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para pagamentos
                        </Link>
                    </Button>

                    {isLoading ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                <Skeleton className="h-48" />
                                <Skeleton className="h-64" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-52" />
                                <Skeleton className="h-40" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Coluna principal */}
                            <div className="space-y-6 lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{payment?.nome}</CardTitle>
                                                {payment?.descricao && (
                                                    <CardDescription className="mt-1">
                                                        {payment.descricao}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            {payment && <StatusBadge status={payment.status} />}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-muted p-2">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Valor</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatCurrency(payment?.valor ?? 0)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-muted p-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Vencimento</p>
                                                    <p className="font-medium">
                                                        {formatDate(payment?.dataVencimento ?? "")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-muted p-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Criado em</p>
                                                    <p className="font-medium">
                                                        {formatDate(payment?.criadoEm ?? "")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-md bg-muted p-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">ID</p>
                                                    <p className="font-mono text-sm">{payment?.id}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Histórico de Tentativas</CardTitle>
                                        <CardDescription>
                                            Registro de todas as tentativas de pagamento
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {safeAttempts.length === 0 ? (
                                            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                                Nenhuma tentativa registrada
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Data/Hora</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden sm:table-cell">
                                                            Observação
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {safeAttempts.map((attempt) => (
                                                        <TableRow key={attempt.id}>
                                                            <TableCell className="text-sm">
                                                                {formatDateTime(attempt.criadoEm)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <StatusBadge
                                                                    status={attempt.status}
                                                                    type="attempt"
                                                                    size="sm"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                                                                {attempt.motivoFalha ?? "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Coluna lateral */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Dados do Cliente</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{client?.nome}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {client ? formatDocument(client.documento) : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">{client?.email}</span>
                                            </div>
                                            {client?.telefone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                            {formatPhone(client.telefone)}
                          </span>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/dashboard/clientes/details?id=${payment?.clienteId}`}>
                                                Ver perfil completo
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Ações</CardTitle>
                                        <CardDescription>
                                            {isPaid
                                                ? "Pagamento concluído"
                                                : podeNovaTentativa
                                                    ? "Gerencie o pagamento"
                                                    : "Pagamento indisponível para novas tentativas"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {isPaid ? (
                                            <div className="rounded-lg bg-success/10 p-4 text-center">
                                                <p className="font-medium text-success">
                                                    Pagamento realizado com sucesso
                                                </p>
                                                <p className="mt-1 text-sm text-success/80">
                                                    {formatCurrency(payment?.valorPago ?? 0)} recebido
                                                </p>
                                            </div>
                                        ) : podeNovaTentativa ? (
                                            <>
                                                {temTentativaPendente ? (
                                                    <div className="rounded-lg bg-warning/10 p-3 text-center text-sm text-warning">
                                                        Tentativa em andamento. Aguarde 10 minutos para tentar novamente.
                                                    </div>
                                                ) : (
                                                    <Button className="w-full" asChild>
                                                        <Link href={`/checkout?id=${pagamentoId}`}>
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Nova Tentativa de Pagamento
                                                        </Link>
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={handleCopyLink}
                                                >
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    {copiedLink ? "Link Copiado!" : "Copiar Link"}
                                                </Button>

                                                <Button variant="outline" className="w-full" asChild>
                                                    <Link href={`/checkout?id=${pagamentoId}`} target="_blank">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Abrir página de pagamento
                                                    </Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                                                {payment?.status === "VENCIDO"
                                                    ? "Pagamento vencido. Não é possível realizar novas tentativas."
                                                    : payment?.status === "CANCELADO"
                                                        ? "Pagamento cancelado."
                                                        : "Prazo de vencimento encerrado."}
                                            </div>
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

export default function DetalhePagamentoPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <DetalhePagamentoContent />
        </Suspense>
    )
}