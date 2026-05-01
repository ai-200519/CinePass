import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { CategorieSiege } from '../../common/enums/categorie-siege.enum';
import { StatutSiege } from '../../common/enums/statut-siege.enum';
import { Salle } from '../../salle/entities/salle.entity';
import { ReservationSiege } from '../../reservation/entities/reservation-siege.entity';

@Entity('siege')
export class Siege {

  @PrimaryGeneratedColumn()
  id_siege: number;

  @Column({ length: 2 })
  rangee: string;

  @Column()
  numero: number;

  @Column({
    type: 'enum',
    enum: CategorieSiege,
    default: CategorieSiege.STANDARD,
  })
  categorie: CategorieSiege;

  @Column({
    type: 'enum',
    enum: StatutSiege,
    default: StatutSiege.DISPONIBLE,
  })
  statut: StatutSiege;

  // Relations
  @ManyToOne(() => Salle, s => s.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_salle' })
  salle: Salle;

  @OneToMany(() => ReservationSiege, rs => rs.siege)
  reservationSieges: ReservationSiege[];
}