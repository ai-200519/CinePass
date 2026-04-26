import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';
import { StatutFilm } from '../../common/enums/statut-film.enum';
import { Seance } from 'src/seance/entities/seance.entity';

@Entity('film')
export class Film {

  @PrimaryGeneratedColumn()
  id_film: number;

  @Column({ length: 255 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  synopsis: string;

  @Column()
  duree: number;

  @Column({ nullable: true, length: 100 })
  genre: string;

  @Column({ nullable: true, length: 50 })
  langue: string;

  @Column({ nullable: true, length: 50 })
  classification: string;

  @Column({ type: 'date', nullable: true })
  dateSortie: Date;

  @Column({ nullable: true, length: 500 })
  affiche: string;

  @Column({ nullable: true, length: 500 })
  bandeAnnonce: string;

  @Column({
    type: 'enum',
    enum: StatutFilm,
    default: StatutFilm.A_VENIR,
  })
  statut: StatutFilm;

  // Relations
  @OneToMany(() => Seance, s => s.film)
  seances: Seance[];
}