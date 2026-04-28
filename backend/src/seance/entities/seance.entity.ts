import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { TechnologieSeance } from '../../common/enums/technologie-seance.enum';
import { StatutSeance } from '../../common/enums/statut-seance.enum';
import { Film } from '../../film/entities/film.entity';
import { Salle } from '../../salle/entities/salle.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Tarif } from '../../tarif/entities/tarif.entity';

@Entity('seance')
export class Seance {

  @PrimaryGeneratedColumn()
  id_seance: number;

  @Column({ type: 'timestamp' })
  dateHeure: Date;

  @Column({
    type: 'enum',
    enum: TechnologieSeance,
    default: TechnologieSeance.DEUX_D,
  })
  technologie: TechnologieSeance;

  @Column({
    type: 'enum',
    enum: StatutSeance,
    default: StatutSeance.PROGRAMMEE,
  })
  statut: StatutSeance;

  // Relations
  @ManyToOne(() => Film, f => f.seances, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_film' })
  film: Film;

  @ManyToOne(() => Salle, s => s.seances, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_salle' })
  salle: Salle;

  @OneToMany(() => Tarif, t => t.seance)
  tarifs: Tarif[];

  @OneToMany(() => Reservation, r => r.seance)
  reservations: Reservation[];
}