const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly data?: unknown
    ) {
        super(message)
        this.name = "ApiError"
    }
}

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("charger_access_token")
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    requiresAuth = true
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    }

    if (requiresAuth) {
        const token = getAuthToken()
        if (token) headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    })

    if (response.status === 204) return undefined as T

    let data: unknown
    try {
        data = await response.json()
    } catch {
        data = null
    }

    if (!response.ok) {
        const message =
            (data as { message?: string })?.message ??
            `Request failed with status ${response.status}`
        throw new ApiError(response.status, message, data)
    }

    return data as T
}

export const apiClient = {
    get: <T>(path: string, requiresAuth = true) =>
        request<T>(path, { method: "GET" }, requiresAuth),

    post: <T>(path: string, body: unknown, requiresAuth = true) =>
        request<T>(
            path,
            { method: "POST", body: JSON.stringify(body) },
            requiresAuth
        ),

    put: <T>(path: string, body: unknown, requiresAuth = true) =>
        request<T>(
            path,
            { method: "PUT", body: JSON.stringify(body) },
            requiresAuth
        ),

    delete: <T>(path: string, requiresAuth = true) =>
        request<T>(path, { method: "DELETE" }, requiresAuth),
}