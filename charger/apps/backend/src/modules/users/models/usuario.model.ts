import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class UsuarioModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 150 })
    nome: string;

    @Column({ type: 'varchar', length: 200, unique: true })
    email: string;

    @Column({ name: 'senha_hash', type: 'varchar' })
    senhaHash: string;

    @Column({ name: 'nome_empresa', type: 'varchar', length: 200 })
    nomeEmpresa: string;

    @Column({ type: 'varchar', length: 14, unique: true })
    cnpj: string;

    @CreateDateColumn({ name: 'criado_em' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em' })
    atualizadoEm: Date;
}