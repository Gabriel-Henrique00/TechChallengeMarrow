import { Usuario } from '../entities/usuario.entity';
import { UsuarioModelo } from '../models/usuario.model';
import { UsuarioRespostaDto } from '../dto/usuario-response.dto';

export class UsuarioMapper {
    static toDomain(modelo: UsuarioModelo): Usuario {
        const usuario        = new Usuario();
        usuario.id           = modelo.id;
        usuario.nome         = modelo.nome;
        usuario.email        = modelo.email;
        usuario.senhaHash    = modelo.senhaHash;
        usuario.nomeEmpresa  = modelo.nomeEmpresa;
        usuario.cnpj         = modelo.cnpj;
        usuario.criadoEm     = modelo.criadoEm;
        usuario.atualizadoEm = modelo.atualizadoEm;
        return usuario;
    }

    static toModel(usuario: Usuario): Partial<UsuarioModelo> {
        return {
            id:          usuario.id,
            nome:        usuario.nome,
            email:       usuario.email,
            senhaHash:   usuario.senhaHash,
            nomeEmpresa: usuario.nomeEmpresa,
            cnpj:        usuario.cnpj,
        };
    }

    static toResponseDto(usuario: Usuario): UsuarioRespostaDto {
        return {
            id:          usuario.id,
            nome:        usuario.nome,
            email:       usuario.email,
            nomeEmpresa: usuario.nomeEmpresa,
            cnpj:        usuario.cnpj,
            criadoEm:    usuario.criadoEm.toISOString(),
        };
    }
}