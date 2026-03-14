"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { paymentService } from "@/services/payment.service"
import { paymentAttemptService } from "@/services/payment-attempt.service"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Payment, Bank } from "@/types"
import {
    Zap, CheckCircle2, Lock, Building2, Calendar, CreditCard,
    Loader2, ArrowRight, ShieldCheck,
} from "lucide-react"

type CheckoutStep =
    | "carregando"
    | "detalhes"
    | "selecionar-banco"
    | "processando"
    | "concluido"
    | "ja-pago"
    | "erro"

function CheckoutContent() {
    const searchParams = useSearchParams()
    const router       = useRouter()
    const pagamentoId  = searchParams.get("id")

    const [payment, setPayment]           = useState<Payment | null>(null)
    const [banks, setBanks]               = useState<Bank[]>([])
    const [step, setStep]                 = useState<CheckoutStep>("carregando")
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
    const [hasError, setHasError]         = useState(false)
    const [redirectUrl, setRedirectUrl]   = useState<string | null>(null)

    useEffect(() => {
        if (!pagamentoId) { router.replace("/"); return }

        Promise.all([
            paymentService.findById(pagamentoId),
            paymentAttemptService.getAvailableBanks(),
        ])
            .then(([p, b]) => {
                setPayment(p)
                setBanks(b)
                setStep(p.status === "PAGO" ? "ja-pago" : "detalhes")
            })
            .catch(() => setHasError(true))
    }, [pagamentoId, router])

    if (hasError) {
        return (
            <main className="flex flex-1 items-center justify-center p-8">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="py-12">
                        <h1 className="mb-2 text-xl font-bold text-destructive">Pagamento não encontrado</h1>
                        <p className="text-muted-foreground">O link de pagamento informado é inválido ou expirou.</p>
                    </CardContent>
                </Card>
            </main>
        )
    }

    const handleConfirmarPagamento = async () => {
        if (!selectedBank || !payment) return
        setStep("processando")

        try {
            const attempt = await paymentAttemptService.create(pagamentoId!, {
                idBanco:   selectedBank.id ?? selectedBank.code,
                nomeBanco: selectedBank.name,
            })
            if (attempt.paymentUrl) setRedirectUrl(attempt.paymentUrl)
            setStep("concluido")
        } catch {
            setStep("erro")
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">

            {/* Carregando */}
            {step === "carregando" && (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* Já pago */}
            {step === "ja-pago" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Pagamento Já Realizado</h1>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                            Esta cobrança já foi paga. Não é necessária uma nova tentativa.
                        </p>
                        <div className="mx-auto max-w-sm rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">Valor pago</p>
                            <p className="text-2xl font-bold">{formatCurrency(payment?.valor ?? 0)}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{payment?.nome}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Detalhes do pagamento */}
            {step === "detalhes" && payment && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Realizar Pagamento</h1>
                        <p className="mt-2 text-muted-foreground">Confira os dados da cobrança antes de prosseguir</p>
                    </div>

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

                            <Button className="w-full" size="lg" onClick={() => setStep("selecionar-banco")}>
                                Continuar para pagamento
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Pagamento processado via Pluggy (Open Finance)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Seleção de banco */}
            {step === "selecionar-banco" && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Escolha seu Banco</h1>
                        <p className="mt-2 text-muted-foreground">
                            Selecione a instituição financeira para realizar o pagamento
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bancos Disponíveis</CardTitle>
                            <CardDescription>Utilize a Iniciação de Pagamento via Open Finance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {banks.map((bank) => (
                                    <button
                                        key={bank.id ?? bank.code}
                                        onClick={() => setSelectedBank(bank)}
                                        className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                                            selectedBank?.id === bank.id ? "border-primary bg-primary/5" : "border-border"
                                        }`}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{bank.name}</p>
                                            <p className="text-xs text-muted-foreground">Código: {bank.code}</p>
                                        </div>
                                        {selectedBank?.id === bank.id && (
                                            <CheckCircle2 className="ml-auto h-5 w-5 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Valor total a pagar</p>
                                    <p className="text-2xl font-bold">{formatCurrency(payment?.valor ?? 0)}</p>
                                </div>
                                <Button size="lg" disabled={!selectedBank} onClick={handleConfirmarPagamento}>
                                    Confirmar Pagamento
                                </Button>
                            </div>
                            {selectedBank && (
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Você será redirecionado para o aplicativo do{" "}
                                    <span className="font-medium text-foreground">{selectedBank.name}</span>{" "}
                                    para confirmar o pagamento.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Button variant="ghost" className="w-full" onClick={() => setStep("detalhes")}>
                        Voltar
                    </Button>
                </div>
            )}

            {/* Processando */}
            {step === "processando" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Processando Pagamento</h1>
                        <p className="mx-auto max-w-md text-muted-foreground">
                            Aguarde enquanto iniciamos sua transação via Open Finance...
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Concluído */}
            {step === "concluido" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Tentativa Registrada!</h1>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                            Sua tentativa foi registrada com sucesso via Pluggy Open Finance.
                        </p>
                        {redirectUrl && (
                            <Button size="lg" asChild className="mb-6">
                                <a href={redirectUrl} target="_blank" rel="noopener noreferrer">
                                    Continuar no banco
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        <div className="mx-auto max-w-sm rounded-lg bg-muted p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Valor</span>
                                <span className="font-bold">{formatCurrency(payment?.valor ?? 0)}</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Banco</span>
                                <span className="font-medium">{selectedBank?.name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Erro */}
            {step === "erro" && (
                <Card className="text-center">
                    <CardContent className="py-12">
                        <h1 className="mb-2 text-2xl font-bold text-destructive">Erro ao Processar</h1>
                        <p className="text-muted-foreground">
                            Não foi possível iniciar o pagamento. Tente novamente.
                        </p>
                        <Button className="mt-6" variant="outline" onClick={() => setStep("selecionar-banco")}>
                            Tentar novamente
                        </Button>
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
                <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
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

            <Suspense fallback={
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                <CheckoutContent />
            </Suspense>

            <footer className="border-t border-border bg-card py-6">
                <div className="mx-auto max-w-3xl px-4 text-center text-sm text-muted-foreground">
                    <p>
                        Pagamento processado com segurança via{" "}
                        <span className="font-medium text-foreground">Pluggy</span> (Open Finance)
                    </p>
                    <p className="mt-1">
                        Dúvidas?{" "}
                        <a href="mailto:suporte@charger.com" className="text-primary underline underline-offset-4">
                            suporte@charger.com
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    )
}