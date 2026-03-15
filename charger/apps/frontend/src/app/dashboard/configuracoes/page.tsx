import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Building2, CreditCard, ExternalLink, Info } from "lucide-react"

export default function ConfiguracoesPage() {
    return (
        <>
            <AppHeader title="Configurações" subtitle="Informações do sistema" />
            <main className="flex-1 overflow-auto p-6">
                <div className="mx-auto max-w-3xl space-y-6">

                    {/* Dados da empresa */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-muted p-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle>Dados da Empresa</CardTitle>
                                    <CardDescription>
                                        Informações que aparecem nas cobranças
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                <Info className="h-4 w-4 flex-shrink-0" />
                                <span>Estes dados são apenas informativos e não podem ser alterados por aqui.</span>
                            </div>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Razão Social</FieldLabel>
                                    <Input defaultValue="Charger Pagamentos Ltda" disabled />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel>CNPJ</FieldLabel>
                                        <Input defaultValue="00.000.000/0001-00" disabled />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Telefone</FieldLabel>
                                        <Input defaultValue="(11) 99999-0000" disabled />
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel>E-mail de Suporte</FieldLabel>
                                    <Input type="email" defaultValue="suporte@charger.com" disabled />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    {/* Integração Pluggy */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-muted p-2">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle>Integração Pluggy</CardTitle>
                                    <CardDescription>
                                        Status da integração com Open Finance
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-success/10 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-success" />
                                    <div>
                                        <p className="font-medium text-success">Integração Ativa</p>
                                        <p className="text-sm text-success/80">
                                            Conectado à API da Pluggy via Open Finance
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Client ID</FieldLabel>
                                    <Input defaultValue="••••••••••••••••" disabled />
                                </Field>
                                <Field>
                                    <FieldLabel>Client Secret</FieldLabel>
                                    <Input type="password" defaultValue="••••••••••••••••••••••••" disabled />
                                </Field>
                                <Field>
                                    <FieldLabel>URL do Webhook</FieldLabel>
                                    <Input defaultValue="/webhooks/pluggy" disabled />
                                </Field>
                            </FieldGroup>

                            <div className="mt-6">
                                <Button variant="outline" asChild>
                                    <a href="https://docs.pluggy.ai" target="_blank" rel="noopener noreferrer">
                                        Ver Documentação Pluggy
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </>
    )
}