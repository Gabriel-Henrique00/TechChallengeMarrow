import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IClientesRepository } from './repositories/clientes.repository';
import { ClienteMapper } from './mappers/cliente.mapper';
import { CriarClienteDto } from './dto/create-cliente.dto';
import { ClienteRespostaDto } from './dto/cliente-response.dto';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';

@Injectable()
export class ClientesService {
    constructor(
        @Inject('IClientesRepository')
        private readonly clientesRepository: IClientesRepository,
    ) {}

    async create(dto: CriarClienteDto): Promise<ClienteRespostaDto> {
        const emailExiste = await this.clientesRepository.findByEmail(dto.email);
        if (emailExiste) {
            throw new ConflictException(`O e-mail ${dto.email} já está em uso por outro cliente.`);
        }

        const documentoExiste = await this.clientesRepository.findByDocumento(dto.documento);
        if (documentoExiste) {
            throw new ConflictException(`O documento ${dto.documento} já está cadastrado.`);
        }

        const cliente = ClienteMapper.fromCreateDto(dto);
        const salvo   = await this.clientesRepository.create(cliente);
        return ClienteMapper.toResponseDto(salvo);
    }

    async findAll(): Promise<ClienteRespostaDto[]> {
        const clientes = await this.clientesRepository.findAll();
        return clientes.map(ClienteMapper.toResponseDto);
    }

    async findById(id: string): Promise<ClienteRespostaDto> {
        const cliente = await this.clientesRepository.findById(id);
        if (!cliente) throw new ResourceNotFoundException('Cliente', id);
        return ClienteMapper.toResponseDto(cliente);
    }
}