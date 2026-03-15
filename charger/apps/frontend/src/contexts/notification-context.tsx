"use client"

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface AppNotification {
    id:        string
    type:      NotificationType
    title:     string
    message:   string
    paymentId?: string
    createdAt: Date
    read:      boolean
}

interface NotificationContextValue {
    notifications: AppNotification[]
    unreadCount:   number
    addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void
    markAllAsRead:   () => void
    markAsRead:      (id: string) => void
    clearAll:        () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([])

    const addNotification = useCallback(
        (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
            const newNotif: AppNotification = {
                ...n,
                id:        crypto.randomUUID(),
                createdAt: new Date(),
                read:      false,
            }
            setNotifications((prev) => [newNotif, ...prev].slice(0, 50))
        },
        []
    )

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }, [])

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
    }, [])

    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, addNotification, markAllAsRead, markAsRead, clearAll }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext)
    if (!context) throw new Error("useNotifications must be used inside <NotificationProvider>")
    return context
}