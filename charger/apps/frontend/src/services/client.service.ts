import { apiClient } from "@/lib/api-client"
import type { Client, CreateClientPayload } from "@/types"

export const clientService = {
    async findAll(): Promise<Client[]> {
        return apiClient.get<Client[]>("/clients")
    },

    async findById(clienteId: string): Promise<Client> {
        return apiClient.get<Client>(`/clients/${clienteId}`)
    },

    async create(payload: CreateClientPayload): Promise<Client> {
        return apiClient.post<Client>("/clients", {
            nome: payload.nome,
            email: payload.email,
            documento: payload.documento.replace(/\D/g, ""),
            ...(payload.telefone
                ? { telefone: payload.telefone.replace(/\D/g, "") }
                : {}),
        })
    },
}