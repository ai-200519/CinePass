
import { Utilisateur } from 'src/utilisateur/entities/utilisateur.entity';
import { Salle } from '../../salle/entities/salle.entity';
import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';

@Entity('cinema')
export class Cinema {

  @PrimaryGeneratedColumn()
  id_cinema: number;

  @Column({ length: 200 })
  nom: string;

  @Column({ nullable: true, length: 500 })
  adresse: string;

  @Column({ nullable: true, length: 100 })
  ville: string;

  @Column({ nullable: true, length: 20 })
  telephone: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  // Relations
  @OneToMany(() => Salle, s => s.cinema)
  salles: Salle[];

  @OneToMany(() => Utilisateur, u => u.cinema)
  staff: Utilisateur[];
}

