import { apiClient } from "@/lib/api-client"
import type { AuthResponse, LoginPayload, RegisterPayload, AuthUser } from "@/types"

const TOKEN_KEY = "charger_access_token"
const USER_KEY  = "charger_user"

export const authService = {
    async login(payload: LoginPayload): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>("/auth/login", payload, false)
        localStorage.setItem(TOKEN_KEY, response.accessToken)
        localStorage.setItem(USER_KEY, JSON.stringify(response.usuario))
        return response
    },

    async register(payload: RegisterPayload): Promise<void> {
        await apiClient.post("/users", payload, false)
    },

    logout(): void {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    },

    getStoredUser(): AuthUser | null {
        if (typeof window === "undefined") return null
        const raw = localStorage.getItem(USER_KEY)
        if (!raw) return null
        try {
            return JSON.parse(raw) as AuthUser
        } catch {
            return null
        }
    },

    getToken(): string | null {
        if (typeof window === "undefined") return null
        return localStorage.getItem(TOKEN_KEY)
    },

    isAuthenticated(): boolean {
        return !!this.getToken()
    },
}