import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Cinema } from '../../cinema/entities/cinema.entity';
import { Seance } from '../../seance/entities/seance.entity';
import { Siege } from '../../siege/entities/siege.entity';

@Entity('salle')
export class Salle {

  @PrimaryGeneratedColumn()
  id_salle: number;

  @Column()
  numero: number;

  @Column({ nullable: true, length: 100 })
  nom: string;

  @Column()
  capaciteTotale: number;

  @Column({ nullable: true, length: 255 })
  equipements: string;

  // Relations
  @ManyToOne(() => Cinema, c => c.salles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cinema' })
  cinema: Cinema;

  @OneToMany(() => Siege, s => s.salle)
  sieges: Siege[];

  @OneToMany(() => Seance, s => s.salle)
  seances: Seance[];
}