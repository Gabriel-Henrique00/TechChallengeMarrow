import { AppHeader } from "@/components/layout/app-header"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Building2, CreditCard, Bell, ExternalLink } from "lucide-react"

const NOTIFICATION_SETTINGS = [
    { title: "Pagamento Recebido",        desc: "Receber e-mail quando um pagamento for confirmado",   defaultChecked: true  },
    { title: "Pagamento Não Autorizado",  desc: "Receber alerta quando um pagamento falhar",            defaultChecked: true  },
    { title: "Cobrança Vencida",          desc: "Receber lembrete de cobranças não pagas",              defaultChecked: true  },
    { title: "Relatório Semanal",         desc: "Receber resumo semanal de recebíveis",                 defaultChecked: false },
]

export default function ConfiguracoesPage() {
    return (
        <>
            <AppHeader title="Configurações" subtitle="Gerencie as configurações do sistema" />
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
                                    <CardDescription>Informações que aparecerão nas cobranças</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="razaoSocial">Razão Social</FieldLabel>
                                    <Input id="razaoSocial" defaultValue="Charger Pagamentos Ltda" />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
                                        <Input id="cnpj" defaultValue="00.000.000/0001-00" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                                        <Input id="telefone" defaultValue="(11) 99999-0000" />
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="emailSuporte">E-mail de Suporte</FieldLabel>
                                    <Input id="emailSuporte" type="email" defaultValue="suporte@charger.com" />
                                </Field>
                            </FieldGroup>
                            <div className="mt-6 flex justify-end">
                                <Button>Salvar Alterações</Button>
                            </div>
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
                                    <CardDescription>Configurações da integração com Open Finance</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-success/10 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-success" />
                                    <div>
                                        <p className="font-medium text-success">Integração Ativa</p>
                                        <p className="text-sm text-success/80">Conectado à API da Pluggy</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-6" />
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="clientId">Client ID</FieldLabel>
                                    <Input id="clientId" defaultValue="••••••••••••••••" disabled />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="clientSecret">Client Secret</FieldLabel>
                                    <Input id="clientSecret" type="password" defaultValue="••••••••••••••••••••••••" disabled />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="webhookUrl">URL do Webhook</FieldLabel>
                                    <Input id="webhookUrl" defaultValue="https://api.charger.com/webhooks/pluggy" disabled />
                                </Field>
                            </FieldGroup>
                            <div className="mt-6 flex items-center justify-between">
                                <Button variant="outline" asChild>
                                    <a href="https://docs.pluggy.ai" target="_blank" rel="noopener noreferrer">
                                        Ver Documentação
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                                <Button variant="outline">Testar Conexão</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notificações */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-md bg-muted p-2">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <CardTitle>Notificações</CardTitle>
                                    <CardDescription>Configure como você deseja receber alertas</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {NOTIFICATION_SETTINGS.map((item, i) => (
                                    <div key={i}>
                                        {i > 0 && <Separator className="mb-4" />}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                            <Switch defaultChecked={item.defaultChecked} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}