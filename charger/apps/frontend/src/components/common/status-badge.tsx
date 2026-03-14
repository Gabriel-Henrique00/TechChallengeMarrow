import { cn } from "@/lib/utils"
import { getPaymentStatusLabel, getAttemptStatusLabel } from "@/lib/utils"
import type { PaymentStatus, AttemptStatus } from "@/types"
import { CheckCircle2, Clock, XCircle, Loader2, Ban } from "lucide-react"

type AnyStatus = PaymentStatus | AttemptStatus

interface StatusBadgeProps {
    status: AnyStatus
    type?: "payment" | "attempt"
    showIcon?: boolean
    size?: "sm" | "md"
}

const STATUS_CONFIG: Record<AnyStatus, { className: string; icon: React.ElementType }> = {
    PAGO:                 { className: "bg-success/10 text-success border-success/20",         icon: CheckCircle2 },
    SUCESSO:              { className: "bg-success/10 text-success border-success/20",         icon: CheckCircle2 },
    AGUARDANDO_PAGAMENTO: { className: "bg-warning/10 text-warning border-warning/20",         icon: Clock        },
    PENDENTE:             { className: "bg-warning/10 text-warning border-warning/20",         icon: Clock        },
    NAO_AUTORIZADO:       { className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle  },
    FALHA:                { className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle  },
    CANCELADO:            { className: "bg-muted text-muted-foreground border-border",         icon: Ban          },
    VENCIDO:              { className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle  },
}

export function StatusBadge({
                                status,
                                type = "payment",
                                showIcon = true,
                                size = "md",
                            }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status]
    const Icon   = config?.icon ?? Clock
    const label  =
        type === "payment"
            ? getPaymentStatusLabel(status as PaymentStatus)
            : getAttemptStatusLabel(status as AttemptStatus)

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-medium",
                config?.className,
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
            )}
        >
      {showIcon && (
          <Icon
              className={cn(
                  status === "PENDENTE" && "animate-spin",
                  size === "sm" ? "h-3 w-3" : "h-4 w-4"
              )}
          />
      )}
            {label}
    </span>
    )
}