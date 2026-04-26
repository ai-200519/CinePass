import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn
} from 'typeorm';
import { MethodePaiement } from '../../common/enums/methode-paiement.enum';
import { StatutPaiement } from '../../common/enums/statut-paiement.enum';
import { Reservation } from '../../reservation/entities/reservation.entity';

@Entity('paiement')
export class Paiement {

  @PrimaryGeneratedColumn()
  id_paiement: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  montantTotal: number;

  @Column({ length: 3, default: 'MAD' })
  devise: string;

  @Column({ type: 'enum', enum: MethodePaiement })
  methode: MethodePaiement;

  @Column({
    type: 'enum',
    enum: StatutPaiement,
    default: StatutPaiement.EN_ATTENTE,
  })
  statut: StatutPaiement;

  @Column({ unique: true, nullable: true, length: 255 })
  referenceTransaction: string;

  @Column({ type: 'timestamp', nullable: true })
  datePaiement: Date;

  // Relations
  @OneToOne(() => Reservation, r => r.paiement, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;
}