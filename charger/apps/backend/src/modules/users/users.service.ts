import { Injectable, Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { IUsuariosRepository } from './repositories/usuarios.repository';
import { UsuarioMapper } from './mappers/usuario.mapper';
import { CriarUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-response.dto';
import { Usuario } from './entities/usuario.entity';
import { ResourceNotFoundException } from '../../shared/exceptions/resource-not-found.exception';

@Injectable()
export class UsuariosService {
    constructor(
        @Inject('IUsuariosRepository')
        private readonly usuariosRepository: IUsuariosRepository,
    ) {}

    async create(dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
        const emailExiste = await this.usuariosRepository.findByEmail(dto.email);
        if (emailExiste) {
            throw new ConflictException(`O e-mail ${dto.email} já está em uso.`);
        }

        const cnpjExiste = await this.usuariosRepository.findByCnpj(dto.cnpj);
        if (cnpjExiste) {
            throw new ConflictException(`O CNPJ ${dto.cnpj} já está cadastrado.`);
        }

        const senhaHash      = await bcrypt.hash(dto.senha, 10);
        const usuario        = new Usuario();
        usuario.nome         = dto.nome;
        usuario.email        = dto.email;
        usuario.senhaHash    = senhaHash;
        usuario.nomeEmpresa  = dto.nomeEmpresa;
        usuario.cnpj         = dto.cnpj;

        const salvo = await this.usuariosRepository.create(usuario);
        return UsuarioMapper.toResponseDto(salvo);
    }

    async findAll(): Promise<UsuarioRespostaDto[]> {
        const usuarios = await this.usuariosRepository.findAll();
        return usuarios.map(UsuarioMapper.toResponseDto);
    }

    async findById(id: string): Promise<UsuarioRespostaDto> {
        const usuario = await this.usuariosRepository.findById(id);
        if (!usuario) throw new ResourceNotFoundException('Usuário', id);
        return UsuarioMapper.toResponseDto(usuario);
    }

    async findByEmailComSenha(email: string): Promise<Usuario | null> {
        return this.usuariosRepository.findByEmail(email);
    }
}