import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';
import { StatutFilm } from '../../common/enums/statut-film.enum';
import { Seance } from '../../seance/entities/seance.entity';

@Entity('film')
export class Film {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  releaseDate: Date;

  @Column({ nullable: true })
  director: string;

  @Column("text", { array: true, nullable: true })
  actors: string[];

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  poster: string;

  @Column({ nullable: true })
  trailer: string;

  @Column('decimal', { precision: 3, scale: 1, default: 0, nullable: true })
  note: number;
  @Column({ nullable: true })
  isShowing: boolean;

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