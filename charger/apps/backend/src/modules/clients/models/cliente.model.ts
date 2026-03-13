import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { PagamentoModelo } from '../../payment/models/pagamento.model';
import { UsuarioModelo } from '../../users/models/usuario.model';

@Entity('clientes')
@Unique('UQ_cliente_usuario_email', ['usuarioId', 'email'])
@Unique('UQ_cliente_usuario_documento', ['usuarioId', 'documento'])
export class ClienteModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'usuario_id', type: 'varchar' })
    usuarioId: string;

    @Column({ type: 'varchar' })
    nome: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    telefone: string | null;

    @Column({ type: 'varchar', length: 14 })
    documento: string;

    @CreateDateColumn({ name: 'criado_em' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em' })
    atualizadoEm: Date;

    @ManyToOne(() => UsuarioModelo)
    @JoinColumn({ name: 'usuario_id' })
    usuario: UsuarioModelo;

    @OneToMany(() => PagamentoModelo, (pagamento) => pagamento.cliente)
    pagamentos: PagamentoModelo[];
}