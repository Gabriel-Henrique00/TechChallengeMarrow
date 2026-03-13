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
import { TentativaTransacaoModelo } from '../../payment-attempts/models/tentativa-transacao.model';
import { UsuarioModelo } from '../../users/models/usuario.model';
import { PaymentAlreadyPaidException } from '../../../shared/exceptions/payment-already-paid.exception';

@Entity('pagamentos')
export class PagamentoModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'usuario_id', type: 'varchar' })
    usuarioId: string;

    @Column({ name: 'cliente_id', type: 'varchar' })
    clienteId: string;

    @Column({ type: 'varchar' })
    nome: string;

    @Column({ type: 'varchar', nullable: true })
    descricao: string | null;

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

    @ManyToOne(() => UsuarioModelo)
    @JoinColumn({ name: 'usuario_id' })
    usuario: UsuarioModelo;

    @ManyToOne(() => ClienteModelo, (cliente) => cliente.pagamentos)
    @JoinColumn({ name: 'cliente_id' })
    cliente: ClienteModelo;

    @OneToMany(() => TentativaTransacaoModelo, (tentativa) => tentativa.pagamento)
    tentativas: TentativaTransacaoModelo[];

    podeReceberTentativa(): void {
        if (this.status === StatusPagamento.PAGO) {
            throw new PaymentAlreadyPaidException(this.id);
        }
    }

    marcarComoPago(valorRecebido: number): void {
        this.status   = StatusPagamento.PAGO;
        this.valorPago = valorRecebido;
    }

    marcarComoNaoAutorizado(): void {
        if (this.status !== StatusPagamento.PAGO) {
            this.status = StatusPagamento.NAO_AUTORIZADO;
        }
    }

    adicionarTentativa(tentativa: TentativaTransacaoModelo): void {
        if (!this.tentativas) this.tentativas = [];
        this.tentativas.push(tentativa);
    }
}