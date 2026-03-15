"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { paymentService, type PublicPayment } from "@/services/payment.service"
import { paymentAttemptService } from "@/services/payment-attempt.service"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
    Zap, CheckCircle2, Lock, Calendar, CreditCard,
    Loader2, ArrowRight, ShieldCheck, AlertCircle,
} from "lucide-react"

type CheckoutStep = "carregando" | "detalhes" | "processando" | "ja-pago" | "erro"

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const pagamentoId  = searchParams.get("id")

    const [payment, setPayment]         = useState<PublicPayment | null>(null)
    const [step, setStep]               = useState<CheckoutStep>("carregando")
    const [loadError, setLoadError]     = useState<string | null>(null)
    const [paymentError, setPaymentError] = useState<string | null>(null)

    useEffect(() => {
        if (!pagamentoId) { router.replace("/"); return }

        paymentService.findByIdPublico(pagamentoId)
            .then((p) => {
                setPayment(p)
                setStep(p.status === "PAGO" ? "ja-pago" : "detalhes")
            })
            .catch((err) => {
                console.error(err)
                setLoadError(err?.message ?? "Erro ao carregar pagamento.")
            })
    }, [pagamentoId, router])

    const handleRealizarPagamento = async () => {
        if (!payment) return
        setPaymentError(null)
        setStep("processando")

        try {
            const attempt = await paymentAttemptService.create(pagamentoId!)

            if (attempt.paymentUrl) {
                window.location.href = attempt.paymentUrl
            } else {
                setPaymentError(
                    attempt.motivoFalha ??
                    "Não foi possível gerar le link de pagamento."
                )
                setStep("detalhes")
            }
        } catch (err: any) {
            console.error(err)
            setPaymentError(err?.message ?? "Erro ao processar pagamento.")
            setStep("detalhes")
        }
    }

    if (loadError) {
        return (
            <main className="flex flex-1 items-center justify-center p-8">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="mb-2 text-xl font-bold text-destructive">
                            Pagamento não encontrado
                        </h1>
                        <p className="text-muted-foreground">{loadError}</p>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-xl px-4 py-8">
            {step === "carregando" && (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {step === "ja-pago" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Pagamento Já Realizado</h1>
                        <div className="mx-auto max-w-sm rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">Valor pago</p>
                            <p className="text-2xl font-bold">{formatCurrency(payment?.valor ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "detalhes" && payment && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Realizar Pagamento</h1>
                        <p className="mt-2 text-muted-foreground">Confira os dados antes de prosseguir</p>
                    </div>

                    {paymentError && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{paymentError}</span>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>{payment.nome}</CardTitle>
                            {payment.descricao && <CardDescription>{payment.descricao}</CardDescription>}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Valor a pagar</p>
                                        <p className="text-xl font-bold">{formatCurrency(payment.valor)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-md bg-muted p-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Vencimento</p>
                                        <p className="font-medium">{formatDate(payment.dataVencimento)}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="mb-1 text-sm text-muted-foreground">Beneficiário</p>
                                <p className="font-medium">{payment.nomeCliente}</p>
                            </div>

                            <Button className="w-full" size="lg" onClick={handleRealizarPagamento}>
                                Realizar Pagamento via Open Finance
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === "processando" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Iniciando Pagamento</h1>
                        <p className="text-muted-foreground">Aguarde, gerando link seguro...</p>
                    </CardContent>
                </Card>
            )}
        </main>
    )
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">Charger</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Pagamento Seguro</span>
                    </div>
                </div>
            </header>

            <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <CheckoutContent />
            </Suspense>
        </div>
    )
}