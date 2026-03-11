import { Cliente } from '../entities/cliente.entity';
import { ClienteModelo } from '../models/cliente.model';
import { CriarClienteDto } from '../dto/create-cliente.dto';
import { ClienteRespostaDto } from '../dto/cliente-response.dto';

export class ClienteMapper {
    static toDomain(modelo: ClienteModelo): Cliente {
        const cliente = new Cliente();
        cliente.id           = modelo.id;
        cliente.nome         = modelo.nome;
        cliente.email        = modelo.email;
        cliente.telefone     = modelo.telefone ?? null;
        cliente.documento    = modelo.documento;
        cliente.criadoEm     = modelo.criadoEm;
        cliente.atualizadoEm = modelo.atualizadoEm;
        return cliente;
    }

    static toModel(cliente: Cliente): Partial<ClienteModelo> {
        return {
            id:        cliente.id,
            nome:      cliente.nome,
            email:     cliente.email,
            telefone:  cliente.telefone,
            documento: cliente.documento,
        };
    }

    static fromCreateDto(dto: CriarClienteDto): Partial<Cliente> {
        const cliente = new Cliente();
        cliente.nome      = dto.nome;
        cliente.email     = dto.email;
        cliente.telefone  = dto.telefone ?? null;
        cliente.documento = dto.documento;
        return cliente;
    }

    static toResponseDto(cliente: Cliente): ClienteRespostaDto {
        return {
            id:        cliente.id,
            nome:      cliente.nome,
            email:     cliente.email,
            telefone:  cliente.telefone,
            documento: cliente.documento,
            criadoEm:  cliente.criadoEm.toISOString(),
        };
    }
}