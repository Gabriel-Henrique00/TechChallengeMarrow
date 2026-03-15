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
import { Zap, Eye, EyeOff, AlertCircle, Copy, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api-client"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading]       = useState(false)
    const [email, setEmail]               = useState("")
    const [password, setPassword]         = useState("")
    const [error, setError]               = useState("")
    const [copiedField, setCopiedField]   = useState<"email" | "senha" | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await login(email, password)
            router.push("/dashboard")
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError("E-mail ou senha incorretos. Verifique suas credenciais.")
            } else {
                setError("Erro ao conectar com o servidor. Tente novamente.")
            }
            setIsLoading(false)
        }
    }

    const handleFillDemo = () => {
        setEmail("charger@charger.com")
        setPassword("charger123")
        setError("")
    }

    const handleCopy = (field: "email" | "senha", value: string) => {
        navigator.clipboard.writeText(value)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">Charger</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sistema de Gestão de Cobranças
                    </p>
                </div>

                {/* Card de credenciais demo */}
                <div className="mb-4 rounded-lg border border-info/30 bg-info/5 p-4">
                    <p className="mb-3 text-sm font-medium text-info">
                        Conta de demonstração com Dados.
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                            <div>
                                <p className="text-xs text-muted-foreground">E-mail</p>
                                <p className="font-mono text-sm">charger@charger.com</p>
                            </div>
                            <button
                                onClick={() => handleCopy("email", "charger@charger.com")}
                                className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                                {copiedField === "email"
                                    ? <Check className="h-4 w-4 text-success" />
                                    : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-background px-3 py-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Senha</p>
                                <p className="font-mono text-sm">charger123</p>
                            </div>
                            <button
                                onClick={() => handleCopy("senha", "charger123")}
                                className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                                {copiedField === "senha"
                                    ? <Check className="h-4 w-4 text-success" />
                                    : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full text-info border-info/30 hover:bg-info/10"
                        onClick={handleFillDemo}
                    >
                        Preencher automaticamente
                    </Button>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                        <CardDescription>Entre com suas credenciais para acessar</CardDescription>
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
                                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                </Field>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="remember" />
                                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                                        Lembrar de mim
                                    </label>
                                </div>
                            </FieldGroup>

                            <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Ainda não tem uma conta?{" "}
                            <Link href="/cadastro" className="text-primary hover:underline">
                                Criar conta
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Ao continuar, você concorda com nossos{" "}
                    <Link href="#" className="underline hover:text-foreground">Termos de Uso</Link>
                    {" "}e{" "}
                    <Link href="#" className="underline hover:text-foreground">Política de Privacidade</Link>
                </p>
            </div>
        </div>
    )
}