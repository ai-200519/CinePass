import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { StatutNotification } from '../../common/enums/statut-notification.enum';
import { Utilisateur } from '../../utilisateur/entities/utilisateur.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

@Entity('notification')
export class Notification {

  @PrimaryGeneratedColumn()
  id_notification: number;

  @Column({ type: 'enum', enum: TypeNotification })
  type: TypeNotification;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'timestamp', nullable: true })
  dateEnvoi: Date;

  @Column({
    type: 'enum',
    enum: StatutNotification,
    nullable: true,
  })
  statut: StatutNotification;

  // Relations
  @ManyToOne(() => Utilisateur, u => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur;

  @ManyToOne(() => Reservation, r => r.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;
}