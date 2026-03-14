import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: {
        default: "Charger - Gestão de Cobranças",
        template: "%s | Charger",
    },
    description:
        "Sistema de gestão de cobranças e recebíveis. Acompanhe pagamentos, gerencie clientes e monitore suas finanças.",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR">
        <body className={`${geist.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    )
}