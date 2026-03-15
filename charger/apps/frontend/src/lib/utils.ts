import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PaymentStatus, AttemptStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style:    "currency",
        currency: "BRL",
    }).format(value)
}

export function formatDate(dateString: string): string {
    if (!dateString) return ""
    return new Intl.DateTimeFormat("pt-BR", {
        day:      "2-digit",
        month:    "2-digit",
        year:     "numeric",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
    if (!dateString) return ""
    return new Intl.DateTimeFormat("pt-BR", {
        day:      "2-digit",
        month:    "2-digit",
        year:     "numeric",
        hour:     "2-digit",
        minute:   "2-digit",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(dateString))
}

export function formatDocument(doc: string): string {
    const clean = doc.replace(/\D/g, "")
    if (clean.length === 11) {
        return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    if (clean.length === 14) {
        return clean.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5"
        )
    }
    return doc
}

export function formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, "")
    if (clean.length === 11) {
        return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    if (clean.length === 10) {
        return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return phone
}

export function dateInputToISO(dateString: string): string {
    if (!dateString) return ""
    return `${dateString}T12:00:00.000Z`
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
        AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
        PAGO:                 "Pago",
        NAO_AUTORIZADO:       "Não autorizado",
        CANCELADO:            "Cancelado",
        VENCIDO:              "Vencido",
    }
    return labels[status] ?? status
}

export function getAttemptStatusLabel(status: AttemptStatus): string {
    const labels: Record<AttemptStatus, string> = {
        PENDENTE:       "Pendente",
        SUCESSO:        "Sucesso",
        FALHA:          "Falhou",
        NAO_AUTORIZADO: "Não autorizado",
    }
    return labels[status] ?? status
}