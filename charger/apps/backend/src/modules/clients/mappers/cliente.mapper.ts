import { Cliente } from '../entities/cliente.entity';
import { ClienteModelo } from '../models/cliente.model';

export class ClienteMapper {
    static paraDominio(modelo: ClienteModelo): Cliente {
        const cliente = new Cliente();
        cliente.id           = modelo.id;
        cliente.nome         = modelo.nome;
        cliente.email        = modelo.email;
        cliente.telefone     = modelo.telefone;
        cliente.documento    = modelo.documento;
        cliente.criadoEm     = modelo.criadoEm;
        cliente.atualizadoEm = modelo.atualizadoEm;
        return cliente;
    }

    static paraModelo(cliente: Cliente): Partial<ClienteModelo> {
        return {
            id:           cliente.id,
            nome:         cliente.nome,
            email:        cliente.email,
            telefone:     cliente.telefone,
            documento:    cliente.documento,
        };
    }
}