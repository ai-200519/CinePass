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
  name: string;

  @Column()
  totalCapacity: number;

  @Column({ nullable: true, length: 255 })
  equipments: string;

  // Relations
  @ManyToOne(() => Cinema, c => c.salles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cinema' })
  cinema: Cinema;

  @OneToMany(() => Siege, s => s.salle)
  seats: Siege[];

  @OneToMany(() => Seance, s => s.salle)
  sessions: Seance[];
}