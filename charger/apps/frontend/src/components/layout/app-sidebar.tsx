"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Receipt,
    Users,
    PlusCircle,
    Settings,
    Zap,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"


const NAV_ITEMS = [
    { label: "Dashboard",       href: "/dashboard",               icon: LayoutDashboard },
    { label: "Pagamentos",      href: "/dashboard/pagamentos",    icon: Receipt        },
    { label: "Novo Pagamento",  href: "/dashboard/pagamentos/create", icon: PlusCircle   },
    { label: "Clientes",        href: "/dashboard/clientes",      icon: Users          },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                        <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">
              Charger
            </span>
                        <span className="text-xs text-sidebar-foreground/60">
              Gestão de Cobranças
            </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_ITEMS.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/dashboard" && item.href !== "/dashboard/pagamentos" && pathname.startsWith(item.href)) ||
                                    (item.href === "/dashboard/pagamentos" && pathname === "/dashboard/pagamentos")

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/dashboard/configuracoes">
                                <Settings className="h-4 w-4" />
                                <span>Configurações</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="mt-4 rounded-lg bg-sidebar-accent p-3">
                    <p className="text-xs text-sidebar-foreground/70">Integração Pluggy</p>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-xs font-medium text-sidebar-foreground">
              Conectado
            </span>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}