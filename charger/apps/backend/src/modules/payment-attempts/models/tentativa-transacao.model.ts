import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { StatusTentativa } from '../../../shared/enums/status-tentativa.enum';
import { PagamentoModelo } from '../../payment/models/pagamento.model';

@Entity('tentativas_transacao')
export class TentativaTransacaoModelo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'pagamento_id', type: 'varchar' })
    pagamentoId: string;

    @Column({ type: 'enum', enum: StatusTentativa })
    status: StatusTentativa;

    @Column({ name: 'referencia_externa', type: 'varchar', nullable: true })
    referenciaExterna: string | null;

    @Column({ name: 'motivo_falha', type: 'varchar', nullable: true })
    motivoFalha: string | null;

    @Column({ name: 'valor_tentativa', type: 'decimal', precision: 10, scale: 2 })
    valorTentativa: number;

    @Column({ name: 'resposta_webhook', type: 'json', nullable: true })
    respostaWebhook: Record<string, any> | null;

    @Column({ name: 'data_tentativa', type: 'datetime' })
    dataTentativa: Date;

    @CreateDateColumn({ name: 'criado_em' })
    criadoEm: Date;

    @ManyToOne(() => PagamentoModelo, (pagamento) => pagamento.tentativas)
    @JoinColumn({ name: 'pagamento_id' })
    pagamento: PagamentoModelo;
}