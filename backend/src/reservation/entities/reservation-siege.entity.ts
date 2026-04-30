import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn
} from 'typeorm';
import { CategorieSiege } from '../../common/enums/categorie-siege.enum';
import { Reservation } from './reservation.entity';
import { Siege } from '../../siege/entities/siege.entity';

@Entity('reservation_siege')
export class ReservationSiege {

  @PrimaryGeneratedColumn()
  id_reservation_siege: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  prixUnitaire: number;

  @Column({ type: 'enum', enum: CategorieSiege })
  categorie: CategorieSiege;

  // Relations
  @ManyToOne(() => Reservation, r => r.reservationSieges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;

  @ManyToOne(() => Siege, s => s.reservationSieges, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_siege' })
  siege: Siege;
}