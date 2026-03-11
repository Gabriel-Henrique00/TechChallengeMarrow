import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { PagamentoModelo } from '../../payment/models/pagamento.model';

@Entity('clientes')
export class ClienteModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    nome: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    telefone: string;

    @Column({ type: 'varchar', length: 14 })
    documento: string;

    @CreateDateColumn({ name: 'criado_em' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em' })
    atualizadoEm: Date;

    @OneToMany(() => PagamentoModelo, (pagamento) => pagamento.cliente)
    pagamentos: PagamentoModelo[];
}