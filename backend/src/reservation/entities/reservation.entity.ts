import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, OneToOne,
  JoinColumn, CreateDateColumn
} from 'typeorm';
import { StatutReservation } from '../../common/enums/statut-reservation.enum';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { ReservationSiege } from './reservation-siege.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Entity('reservation')
export class Reservation {

  @PrimaryGeneratedColumn()
  id_reservation: number;

  @Column({ unique: true, length: 20 })
  reference: string;

  @CreateDateColumn()
  dateReservation: Date;

  @Column({
    type: 'enum',
    enum: StatutReservation,
    default: StatutReservation.EN_COURS,
  })
  statut: StatutReservation;

  @Column({ type: 'text', nullable: true })
  qrCode: string;

  // Relations
  @ManyToOne(() => Utilisateur, u => u.reservations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur;

  @ManyToOne(() => Seance, s => s.reservations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_seance' })
  seance: Seance;

  @OneToMany(() => ReservationSiege, rs => rs.reservation, { cascade: true })
  reservationSieges: ReservationSiege[];

  @OneToOne(() => Paiement, p => p.reservation)
  paiement: Paiement;

  @OneToMany(() => Notification, n => n.reservation)
  notifications: Notification[];
}