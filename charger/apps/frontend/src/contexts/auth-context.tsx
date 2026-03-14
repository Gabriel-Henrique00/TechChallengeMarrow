"use client"

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import type { AuthUser } from "@/types"

interface AuthContextValue {
    user: AuthUser | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, senha: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const stored = authService.getStoredUser()
        if (stored && authService.isAuthenticated()) {
            setUser(stored)
        }
        setIsLoading(false)
    }, [])

    const login = useCallback(async (email: string, senha: string): Promise<void> => {
        const response = await authService.login({ email, senha })
        setUser(response.usuario)
    }, [])

    const logout = useCallback(() => {
        authService.logout()
        setUser(null)
        router.push("/login")
    }, [router])

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
    return context
}