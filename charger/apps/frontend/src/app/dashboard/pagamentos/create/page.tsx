"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { clientService } from "@/services/client.service"
import { paymentService } from "@/services/payment.service"
import { ApiError } from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "@/types"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"

function CriarPagamentoContent() {
    const router         = useRouter()
    const searchParams   = useSearchParams()
    const clienteIdParam = searchParams.get("clienteId") ?? ""

    const [clients, setClients]           = useState<Client[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess]       = useState(false)
    const [error, setError]               = useState("")

    const [formData, setFormData] = useState({
        nome: "", descricao: "", amount: "", clienteId: clienteIdParam, dataVencimento: "",
    })

    useEffect(() => {
        clientService
            .findAll()
            .then((data) => setClients(data ?? []))
            .catch(console.error)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const formatInputCurrency = (value: string) => {
        const numbers = value.replace(/\D/g, "")
        const amount  = parseInt(numbers) / 100
        if (isNaN(amount)) return ""
        return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const getParsedAmount = () => {
        const parts = formData.amount.split(",")
        if (parts.length === 2) {
            const intPart = parts[0].replace(/\./g, "")
            return parseFloat(`${intPart}.${parts[1]}`) || 0
        }
        return parseFloat(formData.amount.replace(/\./g, "").replace(",", ".")) || 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        try {
            await paymentService.create({
                clienteId:      formData.clienteId,
                nome:           formData.nome,
                descricao:      formData.descricao || undefined,
                valor:          getParsedAmount(),
                dataVencimento: new Date(formData.dataVencimento).toISOString(),
            })
            setIsSuccess(true)
            setTimeout(() => router.push("/dashboard/pagamentos"), 2000)
        } catch (err) {
            if (err instanceof ApiError) {
                const msg = (err.data as { message?: string })?.message
                setError(msg ?? "Erro ao criar cobrança. Verifique os dados.")
            } else {
                setError("Erro inesperado. Tente novamente.")
            }
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <>
                <AppHeader title="Novo Pagamento" />
                <main className="flex flex-1 items-center justify-center p-6">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                                <CheckCircle2 className="h-8 w-8 text-success" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">Pagamento Criado!</h2>
                            <p className="text-muted-foreground">A cobrança foi cadastrada com sucesso.</p>
                        </CardContent>
                    </Card>
                </main>
            </>
        )
    }

    return (
        <>
            <AppHeader title="Novo Pagamento" subtitle="Cadastrar uma nova cobrança no sistema" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-2xl">
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link href="/dashboard/pagamentos">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para pagamentos
                        </Link>
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dados da Cobrança</CardTitle>
                            <CardDescription>Preencha as informações para criar uma nova cobrança.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="nome">Nome do Pagamento *</FieldLabel>
                                        <Input
                                            id="nome"
                                            name="nome"
                                            placeholder="Ex: Consultoria Março/2024"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                                        <Textarea
                                            id="descricao"
                                            name="descricao"
                                            placeholder="Detalhes desta cobrança..."
                                            value={formData.descricao}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="amount">Valor (R$) *</FieldLabel>
                                            <Input
                                                id="amount"
                                                name="amount"
                                                placeholder="0,00"
                                                value={formData.amount}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        amount: formatInputCurrency(e.target.value),
                                                    }))
                                                }
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="dataVencimento">Data de Vencimento *</FieldLabel>
                                            <Input
                                                id="dataVencimento"
                                                name="dataVencimento"
                                                type="date"
                                                value={formData.dataVencimento}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <Field>
                                        <FieldLabel>Cliente (Pagador) *</FieldLabel>
                                        <Select
                                            value={formData.clienteId}
                                            onValueChange={(v) =>
                                                setFormData((prev) => ({ ...prev, clienteId: v }))
                                            }
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um cliente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(clients ?? []).map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex flex-col">
                                                            <span>{c.nome}</span>
                                                            <span className="text-xs text-muted-foreground">{c.email}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Não encontrou o cliente?{" "}
                                            <Link
                                                href="/dashboard/clientes/create"
                                                className="text-primary underline underline-offset-4"
                                            >
                                                Cadastrar novo cliente
                                            </Link>
                                        </p>
                                    </Field>
                                </FieldGroup>

                                {formData.amount && (
                                    <div className="mt-6 rounded-lg bg-muted p-4">
                                        <p className="text-sm text-muted-foreground">Valor a ser cobrado:</p>
                                        <p className="text-2xl font-bold">{formatCurrency(getParsedAmount())}</p>
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Criando..." : "Criar Cobrança"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}

export default function CriarPagamentoPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <CriarPagamentoContent />
        </Suspense>
    )
}