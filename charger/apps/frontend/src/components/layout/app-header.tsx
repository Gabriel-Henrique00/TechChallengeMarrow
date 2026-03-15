"use client"

import Link from "next/link"
import { Bell, User, LogOut, Settings, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { cn, formatDateTime } from "@/lib/utils"

interface AppHeaderProps {
    title:     string
    subtitle?: string
}

const NOTIFICATION_COLORS = {
    success: "bg-success/10 text-success border-success/20",
    error:   "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info:    "bg-primary/10 text-primary border-primary/20",
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
    const { user, logout }                                         = useAuth()
    const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications()

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-2" />
                <div>
                    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Sino com notificações */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notificações</span>
                            <div className="flex gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={markAllAsRead}
                                    >
                                        <CheckCheck className="mr-1 h-3 w-3" />
                                        Marcar tudo como lido
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs text-muted-foreground"
                                        onClick={clearAll}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {notifications.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhuma notificação
                            </div>
                        ) : (
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "mx-1 mb-1 rounded-md border p-3 text-sm",
                                            NOTIFICATION_COLORS[notif.type],
                                            !notif.read && "font-medium"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="font-semibold">{notif.title}</p>
                                                <p className="mt-0.5 text-xs opacity-80">
                                                    {notif.message}
                                                </p>
                                                <p className="mt-1 text-xs opacity-60">
                                                    {formatDateTime(notif.createdAt.toISOString())}
                                                </p>
                                            </div>
                                            {notif.paymentId && (
                                                <Link
                                                    href={`/dashboard/pagamentos/details?id=${notif.paymentId}`}
                                                    className="flex-shrink-0 opacity-70 hover:opacity-100"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Menu do usuário */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span>{user?.nome ?? "Usuário"}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {user?.email ?? ""}
                                </span>
                                {user?.nomeEmpresa && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {user.nomeEmpresa}
                                    </span>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/configuracoes" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configurações
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}