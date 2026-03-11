import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { StatusPagamento } from '../../../shared/enums/status-pagamento.enum';
import { ClienteModelo } from '../../clients/models/cliente.model';
import { TentativaTransacaoModelo } from '../../payment-attempts/models/tentativa-transacao';

@Entity('pagamentos')
export class PagamentoModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'cliente_id', type: 'varchar' })
    clienteId: string;

    @Column({ type: 'varchar' })
    nome: string;

    @Column({ type: 'varchar', nullable: true })
    descricao: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor: number;

    @Column({ name: 'valor_pago', type: 'decimal', precision: 10, scale: 2, default: 0 })
    valorPago: number;

    @Column({
        type: 'enum',
        enum: StatusPagamento,
        default: StatusPagamento.AGUARDANDO_PAGAMENTO,
    })
    status: StatusPagamento;

    @Column({ name: 'id_externo', type: 'varchar', nullable: true })
    idExterno: string | null;

    @Column({ name: 'data_vencimento', type: 'datetime' })
    dataVencimento: Date;

    @CreateDateColumn({ name: 'criado_em' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em' })
    atualizadoEm: Date;

    @ManyToOne(() => ClienteModelo, (cliente) => cliente.pagamentos)
    @JoinColumn({ name: 'cliente_id' })
    cliente: ClienteModelo;

    @OneToMany(() => TentativaTransacaoModelo, (tentativa) => tentativa.pagamento)
    tentativas: TentativaTransacaoModelo[];
}