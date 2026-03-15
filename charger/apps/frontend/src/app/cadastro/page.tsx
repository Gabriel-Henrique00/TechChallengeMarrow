"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { authService } from "@/services/auth.service"
import { ApiError } from "@/lib/api-client"

export default function CadastroPage() {
    const router = useRouter()

    const [showPassword, setShowPassword]               = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading]                     = useState(false)
    const [error, setError]                             = useState("")
    const [acceptedTerms, setAcceptedTerms]             = useState(false)

    const [formData, setFormData] = useState({
        nome: "", email: "", nomeEmpresa: "", cnpj: "", senha: "", confirmSenha: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const formatCNPJ = (value: string) => {
        const n = value.replace(/\D/g, "")
        return n
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .slice(0, 18)
    }

    const passwordRequirements = [
        { label: "Mínimo 8 caracteres",            met: formData.senha.length >= 8           },
        { label: "Pelo menos uma letra maiúscula", met: /[A-Z]/.test(formData.senha)         },
        { label: "Pelo menos uma letra minúscula", met: /[a-z]/.test(formData.senha)         },
        { label: "Pelo menos um número",           met: /[0-9]/.test(formData.senha)         },
        { label: "Máximo 72 caracteres",           met: formData.senha.length <= 72          },
    ]

    const passwordsMatch     = formData.senha === formData.confirmSenha && formData.confirmSenha.length > 0
    const allRequirementsMet = passwordRequirements.every((r) => r.met)

    const canSubmit =
        formData.nome.trim().length >= 2        &&
        formData.email.trim().length > 0        &&
        formData.nomeEmpresa.trim().length >= 2 &&
        formData.cnpj.length === 18             &&
        allRequirementsMet                      &&
        passwordsMatch                          &&
        acceptedTerms

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit) return

        setIsLoading(true)
        setError("")

        try {
            await authService.register({
                nome:        formData.nome.trim(),
                email:       formData.email.trim(),
                senha:       formData.senha,
                nomeEmpresa: formData.nomeEmpresa.trim(),
                cnpj:        formData.cnpj.replace(/\D/g, ""),
            })
            router.push("/login")
        } catch (err) {
            if (err instanceof ApiError) {
                const raw = err.data as { message?: string | string[] }
                const msg = Array.isArray(raw?.message)
                    ? raw.message.join(", ")
                    : (raw?.message ?? "Erro ao criar conta.")

                if (err.status === 409) {
                    setError("E-mail ou CNPJ já está em uso.")
                } else {
                    setError(msg)
                }
            } else {
                setError("Erro inesperado. Tente novamente.")
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">Charger</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Sistema de Gestão de Cobranças</p>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Criar sua conta</CardTitle>
                        <CardDescription>Preencha os dados abaixo para começar</CardDescription>
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
                                    <FieldLabel htmlFor="nome">Nome completo *</FieldLabel>
                                    <Input
                                        id="nome"
                                        name="nome"
                                        placeholder="Seu nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        maxLength={150}
                                        required
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="email">E-mail *</FieldLabel>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        maxLength={200}
                                        required
                                    />
                                </Field>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="nomeEmpresa">Nome da Empresa *</FieldLabel>
                                        <Input
                                            id="nomeEmpresa"
                                            name="nomeEmpresa"
                                            placeholder="Empresa Ltda"
                                            value={formData.nomeEmpresa}
                                            onChange={handleChange}
                                            maxLength={200}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="cnpj">CNPJ *</FieldLabel>
                                        <Input
                                            id="cnpj"
                                            name="cnpj"
                                            placeholder="00.000.000/0001-00"
                                            value={formData.cnpj}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))
                                            }
                                            required
                                        />
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="senha">Senha *</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="senha"
                                            name="senha"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.senha}
                                            onChange={handleChange}
                                            maxLength={72}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {formData.senha && (
                                        <div className="mt-2 space-y-1">
                                            {passwordRequirements.map((req, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <div
                                                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                            req.met ? "bg-success text-success-foreground" : "bg-muted"
                                                        }`}
                                                    >
                                                        {req.met && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <span className={req.met ? "text-success" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirmSenha">Confirmar senha *</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="confirmSenha"
                                            name="confirmSenha"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.confirmSenha}
                                            onChange={handleChange}
                                            maxLength={72}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {formData.confirmSenha && (
                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                            <div
                                                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                    passwordsMatch ? "bg-success text-success-foreground" : "bg-destructive"
                                                }`}
                                            >
                                                {passwordsMatch && <Check className="h-3 w-3" />}
                                            </div>
                                            <span className={passwordsMatch ? "text-success" : "text-destructive"}>
                        {passwordsMatch ? "Senhas conferem" : "Senhas não conferem"}
                      </span>
                                        </div>
                                    )}
                                </Field>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(v) => setAcceptedTerms(v as boolean)}
                                    />
                                    <label htmlFor="terms" className="text-sm leading-tight text-muted-foreground">
                                        Li e aceito os{" "}
                                        <Link href="#" className="text-primary hover:underline">Termos de Uso</Link>
                                        {" "}e a{" "}
                                        <Link href="#" className="text-primary hover:underline">Política de Privacidade</Link>
                                    </label>
                                </div>
                            </FieldGroup>

                            <Button
                                type="submit"
                                className="mt-6 w-full"
                                disabled={!canSubmit || isLoading}
                            >
                                {isLoading ? "Criando conta..." : "Criar conta"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-primary hover:underline">Fazer login</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}