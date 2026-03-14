"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { clientService } from "@/services/client.service"
import { ApiError } from "@/lib/api-client"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"

export default function CriarClientePage() {
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess]       = useState(false)
    const [error, setError]               = useState("")

    const [formData, setFormData] = useState({
        nome: "", email: "", documento: "", telefone: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const formatCPFCNPJ = (value: string) => {
        const n = value.replace(/\D/g, "")
        if (n.length <= 11) {
            return n
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        }
        return n
            .replace(/(\d{2})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
    }

    const formatPhone = (value: string) => {
        const n = value.replace(/\D/g, "")
        if (n.length <= 10) {
            return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
        }
        return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")

        try {
            await clientService.create({
                nome:      formData.nome,
                email:     formData.email,
                documento: formData.documento,
                telefone:  formData.telefone || undefined,
            })
            setIsSuccess(true)
            setTimeout(() => router.push("/dashboard/clientes"), 2000)
        } catch (err) {
            if (err instanceof ApiError) {
                const msg = (err.data as { message?: string })?.message
                setError(msg ?? "Erro ao cadastrar cliente. Verifique os dados.")
            } else {
                setError("Erro inesperado. Tente novamente.")
            }
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <>
                <AppHeader title="Novo Cliente" />
                <main className="flex flex-1 items-center justify-center p-6">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-6">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                                <CheckCircle2 className="h-8 w-8 text-success" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold">Cliente Cadastrado!</h2>
                            <p className="text-muted-foreground">O cliente foi adicionado com sucesso.</p>
                        </CardContent>
                    </Card>
                </main>
            </>
        )
    }

    return (
        <>
            <AppHeader title="Novo Cliente" subtitle="Cadastrar um novo cliente no sistema" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-2xl">
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link href="/dashboard/clientes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para clientes
                        </Link>
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Cliente</CardTitle>
                            <CardDescription>
                                Preencha as informações do novo cliente. Campos marcados com * são obrigatórios.
                            </CardDescription>
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
                                        <FieldLabel htmlFor="nome">Nome Completo *</FieldLabel>
                                        <Input
                                            id="nome"
                                            name="nome"
                                            placeholder="Nome do cliente ou razão social"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">E-mail *</FieldLabel>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="email@exemplo.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="documento">CPF/CNPJ *</FieldLabel>
                                            <Input
                                                id="documento"
                                                name="documento"
                                                placeholder="000.000.000-00"
                                                value={formData.documento}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        documento: formatCPFCNPJ(e.target.value),
                                                    }))
                                                }
                                                maxLength={18}
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                                            <Input
                                                id="telefone"
                                                name="telefone"
                                                placeholder="(00) 00000-0000"
                                                value={formData.telefone}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        telefone: formatPhone(e.target.value),
                                                    }))
                                                }
                                                maxLength={15}
                                            />
                                        </Field>
                                    </div>
                                </FieldGroup>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Salvando..." : "Cadastrar Cliente"}
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